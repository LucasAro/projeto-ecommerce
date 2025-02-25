import asyncio
from datetime import datetime, timedelta
from faker import Faker
from bson import ObjectId
import random
from motor.motor_asyncio import AsyncIOMotorClient
import argparse
import os

fake = Faker('pt_BR')

MONGO_URL = "mongodb://admin:admin123@mongodb:27017"
DB_NAME = "ecommerce"

async def connect_to_mongo():
    client = AsyncIOMotorClient(MONGO_URL)
    return client[DB_NAME]

PRODUCTS = [
    "Smartphone", "Notebook", "Tablet", "Smart TV", "Fone de Ouvido",
    "Mouse", "Teclado", "Monitor", "Câmera", "Impressora",
    "Arroz", "Feijão", "Macarrão", "Óleo", "Açúcar",
    "Café", "Leite", "Pão", "Biscoito", "Chocolate",
    "Camiseta", "Calça", "Vestido", "Sapato", "Tênis",
    "Mochila", "Bolsa", "Relógio", "Óculos", "Perfume",
    "Shampoo", "Sabonete", "Creme", "Escova", "Pasta de Dente"
]

ADJECTIVES = [
    "Premium", "Básico", "Profissional", "Luxo", "Ultra",
    "Plus", "Master", "Light", "Pro", "Max",
    "Essential", "Classic", "Modern", "Elite", "Advanced"
]

def generate_product_name():
    product = random.choice(PRODUCTS)
    if random.random() > 0.5:
        adjective = random.choice(ADJECTIVES)
        brand = fake.company().split()[0]
        return f"{brand} {product} {adjective}"
    return f"{fake.company().split()[0]} {product}"


async def create_categories(db, num_categories=10):
    categories = []
    category_types = [
        "Eletrônicos", "Alimentos", "Bebidas", "Roupas", "Acessórios",
        "Casa", "Jardim", "Livros", "Esportes", "Brinquedos",
        "Saúde", "Beleza", "Pet", "Automotivo", "Ferramentas"
    ]

    for _ in range(num_categories):
        category = {
            "_id": ObjectId(),
            "name": random.choice(category_types),
            "created_at": datetime.utcnow()
        }
        categories.append(category)

    if categories:
        await db.categories.insert_many(categories)

    return categories

async def create_products(db, categories, num_products=50):
    products = []

    for _ in range(num_products):
        width = random.choice([200, 300, 400, 500])
        height = random.choice([200, 300, 400, 500])
        image_id = random.randint(1, 1000)

        product_categories = random.sample(
            [cat["_id"] for cat in categories],
            random.randint(1, 3)
        )

        base_price = random.uniform(10, 1000)

        product = {
            "_id": ObjectId(),
            "name": generate_product_name(),
            "description": fake.text(max_nb_chars=200),
            "price": round(base_price, 2),
            "category_ids": product_categories,
            "image_url": f"https://picsum.photos/id/{image_id}/{width}/{height}",
            "created_at": datetime.utcnow()
        }
        products.append(product)

    if products:
        await db.products.insert_many(products)

    return products

async def create_orders(db, products, num_orders=100):
    orders = []

    start_date = datetime.now() - timedelta(days=180)  # últimos 6 meses

    for _ in range(num_orders):
        order_products = random.sample(
            [prod["_id"] for prod in products],
            random.randint(1, 5)
        )

        total = sum(
            next(p["price"] for p in products if p["_id"] == prod_id)
            for prod_id in order_products
        )

        order_date = fake.date_time_between(
            start_date=start_date,
            end_date='now'
        )

        order = {
            "_id": ObjectId(),
            "date": order_date,
            "product_ids": order_products,
            "total": round(total, 2),
            "status": random.choice(["completed", "pending", "cancelled"]),
            "customer_name": fake.name(),
            "created_at": datetime.utcnow()
        }
        orders.append(order)

    if orders:
        await db.orders.insert_many(orders)

    return orders

async def main(args):
    print("Conectando ao MongoDB...")
    db = await connect_to_mongo()

    if args.clear:
        print("Limpando coleções existentes...")
        await db.categories.delete_many({})
        await db.products.delete_many({})
        await db.orders.delete_many({})

    print(f"Criando {args.categories} categorias...")
    categories = await create_categories(db, args.categories)
    print(f"Criadas {len(categories)} categorias.")

    print(f"Criando {args.products} produtos...")
    products = await create_products(db, categories, args.products)
    print(f"Criados {len(products)} produtos.")

    print(f"Criando {args.orders} pedidos...")
    orders = await create_orders(db, products, args.orders)
    print(f"Criados {len(orders)} pedidos.")

    print("População de dados concluída!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Popular banco de dados com dados de teste')
    parser.add_argument('--categories', type=int, default=10, help='Número de categorias para criar')
    parser.add_argument('--products', type=int, default=50, help='Número de produtos para criar')
    parser.add_argument('--orders', type=int, default=100, help='Número de pedidos para criar')
    parser.add_argument('--clear', action='store_true', help='Limpar dados existentes antes de popular')

    args = parser.parse_args()

    asyncio.run(main(args))