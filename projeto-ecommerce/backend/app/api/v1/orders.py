from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
from bson import ObjectId
from app.models.order import Order, OrderCreate, OrderUpdate
from app.core.database import get_collection
import boto3
import json
router = APIRouter()

async def validate_products(product_ids: List[str]) -> float:
    """
    Valida se os produtos existem e calcula o total do pedido
    Retorna o total calculado
    """
    total = 0
    collection = await get_collection("products")

    for prod_id in product_ids:
        product = await collection.find_one({"_id": ObjectId(prod_id)})
        if not product:
            raise HTTPException(
                status_code=400,
                detail=f"Product with id {prod_id} does not exist"
            )
        total += product['price']

    return total

@router.post("/", response_model=Order)
async def create_order(order: OrderCreate):
    collection = await get_collection("orders")

    total = await validate_products(order.product_ids)

    order_dict = order.model_dump()
    order_dict['product_ids'] = [ObjectId(id) for id in order.product_ids]
    order_dict['total'] = total

    new_order = await collection.insert_one(order_dict)
    created_order = await collection.find_one({"_id": new_order.inserted_id})
    return created_order

@router.get("/", response_model=List[Order])
async def list_orders():
    collection = await get_collection("orders")
    orders = await collection.find().to_list(1000)
    return orders

@router.get("/{order_id}", response_model=Order)
async def get_order(order_id: str):
    collection = await get_collection("orders")
    if (order := await collection.find_one({"_id": ObjectId(order_id)})) is not None:
        return order
    raise HTTPException(status_code=404, detail="Order not found")

@router.put("/{order_id}", response_model=Order)
async def update_order(order_id: str, order: OrderUpdate):
    collection = await get_collection("orders")

    total = await validate_products(order.product_ids)

    update_data = order.model_dump()
    update_data['product_ids'] = [ObjectId(id) for id in order.product_ids]
    update_data['total'] = total

    update_result = await collection.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": update_data}
    )

    if update_result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")

    return await collection.find_one({"_id": ObjectId(order_id)})

@router.delete("/{order_id}", response_model=dict)
async def delete_order(order_id: str):
    collection = await get_collection("orders")
    delete_result = await collection.delete_one({"_id": ObjectId(order_id)})

    if delete_result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")

    return {"message": "Order deleted successfully"}


@router.post("/test-lambda/{order_id}")
async def test_lambda(order_id: str):
    try:
        lambda_client = boto3.client(
            'lambda',
            endpoint_url='http://localstack:4566',
            region_name='us-east-1',
            aws_access_key_id='test',
            aws_secret_access_key='test',
            verify=False
        )

        payload = {
            "order_id": order_id
        }

        response = lambda_client.invoke(
            FunctionName='hub-xp-orders-dev-processOrder',
            InvocationType='RequestResponse',
            Payload=json.dumps(payload)
        )

        response_payload = json.loads(response['Payload'].read())

        return {
            "message": "Lambda invocada com sucesso",
            "response": response_payload
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/process-order/{order_id}")
async def process_order(order_id: str):
    try:
        lambda_client = boto3.client(
            'lambda',
            endpoint_url='http://localstack:4566',
            region_name='us-east-1',
            aws_access_key_id='test',
            aws_secret_access_key='test',
            verify=False
        )

        payload = {
            "order_id": order_id
        }

        print(f"Invocando Lambda com payload: {payload}")

        response = lambda_client.invoke(
            FunctionName='hub-xp-orders-dev-processOrder',
            InvocationType='RequestResponse',
            LogType='Tail',  # Importante para capturar logs
            Payload=json.dumps(payload)
        )

        if 'LogResult' in response:
            import base64
            logs = base64.b64decode(response['LogResult']).decode('utf-8')
            print(f"Logs da Lambda:\n{logs}")

        response_payload = json.loads(response['Payload'].read())
        print(f"Resposta completa da Lambda: {response_payload}")

        if response_payload.get('statusCode') != 200:
            raise HTTPException(
                status_code=response_payload.get('statusCode', 500),
                detail=json.loads(response_payload.get('body', '{}'))
            )

        return json.loads(response_payload['body'])

    except Exception as e:
        print(f"Erro na rota process_order: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))