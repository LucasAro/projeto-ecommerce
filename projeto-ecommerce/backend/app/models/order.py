from typing import List, Optional, Annotated, Any
from pydantic import BaseModel, Field, BeforeValidator
from datetime import datetime
from bson import ObjectId

def convert_object_id(id: Any) -> str:
    if isinstance(id, ObjectId):
        return str(id)
    if isinstance(id, str):
        return id
    raise ValueError("Invalid ObjectId")

PydanticObjectId = Annotated[str, BeforeValidator(convert_object_id)]

class OrderBase(BaseModel):
    date: datetime
    product_ids: List[PydanticObjectId]
    total: float

class OrderCreate(OrderBase):
    pass

class OrderUpdate(OrderBase):
    pass

class Order(OrderBase):
    id: PydanticObjectId = Field(default_factory=lambda: str(ObjectId()), alias="_id")

    class Config:
        populate_by_name = True