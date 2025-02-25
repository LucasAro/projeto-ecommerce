from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.products import router as products_router
from app.api.v1.categories import router as categories_router
from app.api.v1.orders import router as orders_router
from app.api.v1.dashboard import router as dashboard_router

app = FastAPI(title="E-commerce API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products_router, prefix="/api/v1/products", tags=["products"])
app.include_router(categories_router, prefix="/api/v1/categories", tags=["categories"])
app.include_router(orders_router, prefix="/api/v1/orders", tags=["orders"])
app.include_router(dashboard_router, prefix="/api/v1/dashboard", tags=["dashboard"])