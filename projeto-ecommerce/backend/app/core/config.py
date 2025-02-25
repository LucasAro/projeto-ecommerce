from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGODB_URL: str = "mongodb://admin:admin123@mongodb:27017"
    DATABASE_NAME: str = "ecommerce"

    AWS_ACCESS_KEY_ID: str = "test"
    AWS_SECRET_ACCESS_KEY: str = "test"
    AWS_ENDPOINT_URL: str = "http://localstack:4566"
    S3_BUCKET_NAME: str = "product-images"

    class Config:
        env_file = ".env"

settings = Settings()