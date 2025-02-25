from fastapi import APIRouter, HTTPException
from typing import List
from bson import ObjectId
from app.models.category import Category, CategoryCreate, CategoryUpdate
from app.core.database import get_collection

router = APIRouter()

@router.post("/", response_model=Category)
async def create_category(category: CategoryCreate):
    collection = await get_collection("categories")
    category_dict = category.model_dump()
    new_category = await collection.insert_one(category_dict)
    created_category = await collection.find_one({"_id": new_category.inserted_id})
    return created_category

@router.get("/", response_model=List[Category])
async def list_categories():
    collection = await get_collection("categories")
    categories = await collection.find().to_list(1000)
    return categories

@router.get("/{category_id}", response_model=Category)
async def get_category(category_id: str):
    collection = await get_collection("categories")
    if (category := await collection.find_one({"_id": ObjectId(category_id)})) is not None:
        return category
    raise HTTPException(status_code=404, detail="Category not found")

@router.put("/{category_id}", response_model=Category)
async def update_category(category_id: str, category: CategoryUpdate):
    collection = await get_collection("categories")
    update_result = await collection.update_one(
        {"_id": ObjectId(category_id)},
        {"$set": category.model_dump()}
    )

    if update_result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")

    return await collection.find_one({"_id": ObjectId(category_id)})

@router.delete("/{category_id}", response_model=dict)
async def delete_category(category_id: str):
    categories_collection = await get_collection("categories")
    products_collection = await get_collection("products")

    category = await categories_collection.find_one({"_id": ObjectId(category_id)})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    await products_collection.update_many(
        {"category_ids": ObjectId(category_id)},
        {"$pull": {"category_ids": ObjectId(category_id)}}
    )

    delete_result = await categories_collection.delete_one({"_id": ObjectId(category_id)})

    if delete_result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")

    return {
        "message": "Category deleted successfully and removed from all products"
    }