from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from app.core.database import get_collection

router = APIRouter()

@router.get("/sales")
async def get_sales_metrics(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    category_ids: Optional[List[str]] = Query(None),
    product_ids: Optional[List[str]] = Query(None)
):
    orders_collection = await get_collection("orders")
    products_collection = await get_collection("products")

    match_stage = {}
    product_object_ids = None

    if start_date or end_date:
        date_filter = {}
        if start_date:
            date_filter["$gte"] = start_date
        if end_date:
            date_filter["$lte"] = end_date
        match_stage["date"] = date_filter

    if product_ids or category_ids:
        product_query = {}

        if product_ids:
            product_query["_id"] = {"$in": [ObjectId(pid) for pid in product_ids]}

        if category_ids:
            product_query["category_ids"] = {
                "$in": [ObjectId(cid) for cid in category_ids]
            }

        products = await products_collection.find(product_query).to_list(None)
        filtered_product_ids = [p["_id"] for p in products]

        if filtered_product_ids:
            match_stage["product_ids"] = {"$in": filtered_product_ids}
        else:
            return {
                "metrics": {
                    "total_orders": 0,
                    "total_revenue": 0,
                    "avg_order_value": 0,
                    "min_order_value": 0,
                    "max_order_value": 0
                },
                "time_series": [],
                "top_products": []
            }

    top_products_pipeline = [
        {"$match": match_stage},
        {"$unwind": "$product_ids"},
    ]

    if "product_ids" in match_stage:
        top_products_pipeline.append({
            "$match": {
                "product_ids": match_stage["product_ids"]
            }
        })

    pipeline = [
        {"$match": match_stage},
        {
            "$group": {
                "_id": None,
                "total_orders": {"$sum": 1},
                "total_revenue": {"$sum": "$total"},
                "avg_order_value": {"$avg": "$total"},
                "min_order_value": {"$min": "$total"},
                "max_order_value": {"$max": "$total"}
            }
        }
    ]

    time_series_pipeline = [
        {"$match": match_stage},
        {
            "$group": {
                "_id": {
                    "year": {"$year": "$date"},
                    "month": {"$month": "$date"},
                    "day": {"$dayOfMonth": "$date"}
                },
                "daily_revenue": {"$sum": "$total"},
                "order_count": {"$sum": 1}
            }
        },
        {
            "$project": {
                "_id": 0,
                "date": {
                    "$dateFromParts": {
                        "year": "$_id.year",
                        "month": "$_id.month",
                        "day": "$_id.day"
                    }
                },
                "revenue": "$daily_revenue",
                "orders": "$order_count"
            }
        },
        {"$sort": {"date": 1}}
    ]

    top_products_pipeline.extend([
        {
            "$group": {
                "_id": "$product_ids",
                "order_count": {"$sum": 1},
                "total_revenue": {"$sum": "$total"}
            }
        },
        {"$sort": {"order_count": -1}},
        {"$limit": 5},
        {
            "$lookup": {
                "from": "products",
                "localField": "_id",
                "foreignField": "_id",
                "as": "product_info"
            }
        },
        {"$unwind": "$product_info"},
        {
            "$project": {
                "_id": 0,
                "product_id": {"$toString": "$_id"},
                "name": "$product_info.name",
                "order_count": 1,
                "total_revenue": 1
            }
        }
    ])

    try:
        metrics = await orders_collection.aggregate(pipeline).to_list(1)
        time_series = await orders_collection.aggregate(time_series_pipeline).to_list(None)
        top_products = await orders_collection.aggregate(top_products_pipeline).to_list(None)

        metrics = metrics[0] if metrics else {
            "total_orders": 0,
            "total_revenue": 0,
            "avg_order_value": 0,
            "min_order_value": 0,
            "max_order_value": 0
        }

        if "_id" in metrics:
            del metrics["_id"]

        return {
            "metrics": metrics,
            "time_series": time_series,
            "top_products": top_products
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))