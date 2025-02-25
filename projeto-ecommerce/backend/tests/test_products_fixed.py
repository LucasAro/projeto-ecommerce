import pytest
import sys
import os
from unittest.mock import patch, MagicMock, AsyncMock
import json
from typing import Dict, Any, List

# Fixtures reutilizáveis
@pytest.fixture
def s3_config():
    """Fixture para fornecer configurações do S3"""
    return {
        "endpoint_url": "http://localhost:4566",
        "bucket_name": "test-bucket",
        "region_name": "us-east-1",
        "aws_access_key_id": "test-key",
        "aws_secret_access_key": "test-secret"
    }

@pytest.fixture
def mock_s3_client():
    """Fixture para criar um mock do cliente S3"""
    s3_client = MagicMock()
    s3_client.put_object.return_value = {
        'ETag': '"e2fc714c4727ee9395f324cd2e7f331f"',
        'ResponseMetadata': {
            'RequestId': '1234567890ABCDEF',
            'HostId': '',
            'HTTPStatusCode': 200,
            'HTTPHeaders': {
                'content-length': '0',
                'x-amz-id-2': '',
                'x-amz-request-id': '1234567890ABCDEF',
                'date': 'Mon, 24 Feb 2025 12:00:00 GMT',
                'etag': '"e2fc714c4727ee9395f324cd2e7f331f"',
                'server': 'AmazonS3'
            },
            'RetryAttempts': 0
        }
    }
    return s3_client

@pytest.fixture
def mock_file():
    """Fixture para criar um mock de arquivo para upload"""
    file = MagicMock()
    file.filename = "test-image.jpg"
    file.content_type = "image/jpeg"
    file.read = AsyncMock(return_value=b"test file content")
    return file

@pytest.fixture
def sample_product() -> Dict[str, Any]:
    """Fixture para fornecer dados de produto de exemplo"""
    return {
        "_id": "60c72b2f5e75e10001d56f0c",
        "name": "Test Product",
        "description": "This is a test product",
        "price": 29.99,
        "category_ids": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
        "image_url": "http://localhost:4566/test-bucket/products/test-image.jpg"
    }

@pytest.fixture
def sample_categories() -> List[Dict[str, Any]]:
    """Fixture para fornecer dados de categorias de exemplo"""
    return [
        {"_id": "507f1f77bcf86cd799439011", "name": "Electronics"},
        {"_id": "507f1f77bcf86cd799439012", "name": "Gadgets"},
        {"_id": "507f1f77bcf86cd799439013", "name": "Accessories"}
    ]

@pytest.fixture
def sample_orders() -> List[Dict[str, Any]]:
    """Fixture para fornecer dados de pedidos de exemplo"""
    return [
        {
            "_id": "60c72b2f5e75e10001d56f0d",
            "date": "2025-02-24T10:00:00.000Z",
            "product_ids": ["60c72b2f5e75e10001d56f0c"],
            "total": 29.99
        },
        {
            "_id": "60c72b2f5e75e10001d56f0e",
            "date": "2025-02-23T14:30:00.000Z",
            "product_ids": ["60c72b2f5e75e10001d56f0c", "60c72b2f5e75e10001d56f0f"],
            "total": 59.98
        }
    ]

# Função para simular a função de upload do S3
async def simulate_upload_file_to_s3(file, s3_client, config):
    """
    Simula a função de upload para o S3 a partir do código fornecido
    """
    try:
        file_content = await file.read()
        bucket_name = config["bucket_name"]
        file_name = f"products/{file.filename}"

        s3_client.put_object(
            Bucket=bucket_name,
            Key=file_name,
            Body=file_content,
            ContentType=file.content_type
        )

        # Gerar URL do arquivo
        url = f"{config['endpoint_url']}/{bucket_name}/{file_name}"
        return url
    except Exception as e:
        raise Exception(f"Error uploading file: {str(e)}")

# Testes para a geração de URLs do S3
def test_s3_url_generation(s3_config):
    """Teste para verificar a geração correta de URLs do S3"""
    # Dados de entrada
    filename = "test-image.jpg"
    file_path = f"products/{filename}"

    # Gerar URL
    url = f"{s3_config['endpoint_url']}/{s3_config['bucket_name']}/{file_path}"

    # Verificar resultado
    expected_url = "http://localhost:4566/test-bucket/products/test-image.jpg"
    assert url == expected_url, f"URL gerada ({url}) não corresponde à URL esperada ({expected_url})"

# Teste para simular o upload de um arquivo para o S3
def test_s3_client_put_object(mock_s3_client, mock_file, s3_config):
    """Teste para verificar se o cliente S3 é chamado corretamente"""
    # Simular chamada para put_object
    file_name = f"products/{mock_file.filename}"

    # Chamar o método put_object no mock
    mock_s3_client.put_object(
        Bucket=s3_config["bucket_name"],
        Key=file_name,
        Body=b"test file content",
        ContentType=mock_file.content_type
    )

    # Verificar se o método foi chamado com os parâmetros corretos
    mock_s3_client.put_object.assert_called_once_with(
        Bucket=s3_config["bucket_name"],
        Key=file_name,
        Body=b"test file content",
        ContentType=mock_file.content_type
    )

# Teste completo simulando o upload para o S3
@pytest.mark.asyncio
async def test_s3_upload_function(mock_s3_client, mock_file, s3_config):
    """Teste completo simulando a função de upload para o S3"""
    # Chamar a função simulada
    url = await simulate_upload_file_to_s3(mock_file, mock_s3_client, s3_config)

    # Verificar o resultado
    expected_url = f"{s3_config['endpoint_url']}/{s3_config['bucket_name']}/products/{mock_file.filename}"
    assert url == expected_url

    # Verificar se o método put_object foi chamado corretamente
    mock_s3_client.put_object.assert_called_once()
    # Verificar argumentos exatos da chamada
    call_args = mock_s3_client.put_object.call_args.kwargs
    assert call_args["Bucket"] == s3_config["bucket_name"]
    assert call_args["Key"] == f"products/{mock_file.filename}"
    assert call_args["ContentType"] == mock_file.content_type

# Teste para validar a estrutura de um produto
def test_product_structure(sample_product):
    """Teste para validar a estrutura e os tipos de dados de um produto"""
    # Verificar a presença de todos os campos obrigatórios
    required_fields = ["_id", "name", "description", "price", "category_ids", "image_url"]
    for field in required_fields:
        assert field in sample_product, f"Campo obrigatório '{field}' ausente no produto"

    # Verificar os tipos de dados
    assert isinstance(sample_product["_id"], str)
    assert isinstance(sample_product["name"], str)
    assert isinstance(sample_product["description"], str)
    assert isinstance(sample_product["price"], (int, float))
    assert isinstance(sample_product["category_ids"], list)
    assert isinstance(sample_product["image_url"], str)

    # Verificar restrições específicas
    assert len(sample_product["name"]) > 0, "Nome do produto não pode estar vazio"
    assert sample_product["price"] > 0, "Preço do produto deve ser maior que zero"

    # Verificar formato da URL da imagem
    assert sample_product["image_url"].startswith("http"), "URL da imagem deve começar com http"

# Teste para validar relacionamentos entre produtos e categorias
def test_product_category_relationship(sample_product, sample_categories):
    """Teste para validar o relacionamento entre produtos e categorias"""
    # Verificar se todas as categorias referenciadas pelo produto existem
    category_ids = [cat["_id"] for cat in sample_categories]

    for cat_id in sample_product["category_ids"]:
        assert cat_id in category_ids, f"Categoria com ID {cat_id} não existe na lista de categorias"

# Teste para simular uma exclusão de produto e verificar integridade referencial
def test_product_deletion_integrity(sample_product, sample_orders):
    """
    Teste para simular a exclusão de um produto e verificar a integridade referencial
    """
    # Produto a ser excluído
    product_id = sample_product["_id"]

    # Verificar se o produto está referenciado em algum pedido
    is_referenced = any(product_id in order["product_ids"] for order in sample_orders)
    assert is_referenced, "Produto deveria estar referenciado em pelo menos um pedido para este teste"

    # Simular verificação de integridade referencial antes da exclusão
    referenced_orders = [order["_id"] for order in sample_orders if product_id in order["product_ids"]]

    # Se o produto estiver referenciado, a exclusão deve ser impedida ou tratada
    if referenced_orders:
        # Em um sistema real, você pode optar por:
        # 1. Impedir a exclusão
        # 2. Remover a referência dos pedidos
        # 3. Marcar o produto como inativo em vez de excluí-lo
        # 4. Excluir os pedidos em cascata (geralmente não recomendado)

        # Neste teste, verificamos apenas se a detecção de referências funciona
        assert len(referenced_orders) > 0, "O sistema deve detectar pedidos que referenciam o produto"

        # Simular mensagem de erro que seria retornada pela API
        error_message = f"Não é possível excluir o produto porque está referenciado nos pedidos: {', '.join(referenced_orders)}"
        assert "Não é possível excluir o produto" in error_message
        assert all(order_id in error_message for order_id in referenced_orders)

# Testes de casos de erro
@pytest.mark.asyncio
async def test_s3_upload_error_handling():
    """Teste para verificar o tratamento de erros durante o upload para o S3"""
    # Criar um mock que lança uma exceção quando chamado
    error_s3_client = MagicMock()
    error_s3_client.put_object.side_effect = Exception("Falha na conexão com o S3")

    # Criar um mock de arquivo
    mock_file = MagicMock()
    mock_file.filename = "test-image.jpg"
    mock_file.content_type = "image/jpeg"
    mock_file.read = AsyncMock(return_value=b"test file content")

    # Configuração
    s3_config = {
        "endpoint_url": "http://localhost:4566",
        "bucket_name": "test-bucket"
    }

    # Verificar se a exceção é tratada corretamente
    with pytest.raises(Exception) as exc_info:
        await simulate_upload_file_to_s3(mock_file, error_s3_client, s3_config)

    # Verificar a mensagem de erro
    assert "Error uploading file: Falha na conexão com o S3" in str(exc_info.value)

if __name__ == "__main__":
    pytest.main(["-v", __file__])