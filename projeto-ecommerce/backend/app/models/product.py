from typing import List, Optional, Annotated, Any
from pydantic import BaseModel, Field, BeforeValidator
from datetime import datetime
from bson import ObjectId

# Função auxiliar para converter string em ObjectId
def convert_object_id(id: Any) -> str:
    if isinstance(id, ObjectId):
        return str(id)
    if isinstance(id, str):
        return id
    raise ValueError("Invalid ObjectId")

# Tipo customizado para ObjectId
PydanticObjectId = Annotated[str, BeforeValidator(convert_object_id)]

class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    category_ids: List[PydanticObjectId] = []
    image_url: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    pass

class Product(ProductBase):
    id: PydanticObjectId = Field(default_factory=lambda: str(ObjectId()), alias="_id")

    class Config:
        populate_by_name = True