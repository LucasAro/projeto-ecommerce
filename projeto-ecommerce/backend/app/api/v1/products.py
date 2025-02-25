from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from fastapi.responses import JSONResponse
from typing import List, Optional
from bson import ObjectId
import boto3
import json
from app.models.product import Product, ProductCreate, ProductUpdate
from app.core.database import get_collection
from app.core.config import settings

router = APIRouter()

async def upload_file_to_s3(file: UploadFile) -> str:
    s3 = boto3.client(
        's3',
        endpoint_url=settings.AWS_ENDPOINT_URL,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name='us-east-1',
        verify=False
    )

    try:
        file_content = await file.read()
        bucket_name = settings.S3_BUCKET_NAME
        file_name = f"products/{file.filename}"

        s3.put_object(
            Bucket=bucket_name,
            Key=file_name,
            Body=file_content,
            ContentType=file.content_type
        )

        url = f"{settings.AWS_ENDPOINT_URL}/{bucket_name}/{file_name}"
        return url
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")

@router.post("/", response_model=Product)
async def create_product(
    name: str,
    description: str,
    price: float,
    category_ids: List[str] = [],
    image_url: Optional[str] = None
):
    collection = await get_collection("products")
    product_data = {
        "name": name,
        "description": description,
        "price": price,
        "category_ids": [ObjectId(id) for id in category_ids] if category_ids else [],
        "image_url": image_url
    }

    new_product = await collection.insert_one(product_data)
    created_product = await collection.find_one({"_id": new_product.inserted_id})
    return created_product

async def validate_categories(category_ids: List[str]) -> bool:
    collection = await get_collection("categories")
    for cat_id in category_ids:
        try:
            category = await collection.find_one({"_id": ObjectId(cat_id)})
            if not category:
                raise HTTPException(
                    status_code=400,
                    detail=f"Category with id {cat_id} does not exist"
                )
        except Exception:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid category id format: {cat_id}"
            )
    return True

@router.post("/with-image/", response_model=Product)
async def create_product_with_image(
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    category_ids: str = Form("[]"),
    image: UploadFile = File(...)
):
    try:
        category_ids_list = json.loads(category_ids)
        await validate_categories(category_ids_list)

        image_url = await upload_file_to_s3(image)

        collection = await get_collection("products")
        product_data = {
            "name": name,
            "description": description,
            "price": price,
            "category_ids": [ObjectId(id) for id in category_ids_list],
            "image_url": image_url
        }

        new_product = await collection.insert_one(product_data)
        created_product = await collection.find_one({"_id": new_product.inserted_id})
        return created_product

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[Product])
async def list_products():
    collection = await get_collection("products")
    products = await collection.find().to_list(1000)
    return products

@router.get("/{product_id}", response_model=Product)
async def get_product(product_id: str):
    collection = await get_collection("products")
    if (product := await collection.find_one({"_id": ObjectId(product_id)})) is not None:
        return product
    raise HTTPException(status_code=404, detail="Product not found")

@router.put("/{product_id}", response_model=Product)
async def update_product(product_id: str, product: ProductUpdate):
    collection = await get_collection("products")

    update_data = product.model_dump()

    if update_data.get('category_ids'):
        update_data['category_ids'] = [ObjectId(id) for id in update_data['category_ids']]

    update_result = await collection.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": update_data}
    )

    if update_result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")

    return await collection.find_one({"_id": ObjectId(product_id)})

@router.delete("/{product_id}", response_model=dict)
async def delete_product(product_id: str):
    collection = await get_collection("products")
    delete_result = await collection.delete_one({"_id": ObjectId(product_id)})

    if delete_result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")

    return {"message": "Product deleted successfully"}