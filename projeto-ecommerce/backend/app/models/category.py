from typing import List, Optional, Annotated, Any
from pydantic import BaseModel, Field, BeforeValidator
from bson import ObjectId

def convert_object_id(id: Any) -> str:
    if isinstance(id, ObjectId):
        return str(id)
    if isinstance(id, str):
        return id
    raise ValueError("Invalid ObjectId")

PydanticObjectId = Annotated[str, BeforeValidator(convert_object_id)]

class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(CategoryBase):
    pass

class Category(CategoryBase):
    id: PydanticObjectId = Field(default_factory=lambda: str(ObjectId()), alias="_id")

    class Config:
        populate_by_name = True