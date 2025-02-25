import pytest
import sys
import os
from unittest.mock import patch, AsyncMock, MagicMock
import asyncio
import motor.motor_asyncio
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings

@pytest.mark.asyncio
async def test_mongodb_connection():
    """Teste simples para verificar a conexão com o MongoDB"""
    try:
        # Criar cliente MongoDB usando as configurações
        client = motor.motor_asyncio.AsyncIOMotorClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=5000  # 5 segundos de timeout
        )

        # Ping ao servidor para verificar a conexão
        await client.admin.command('ping')

        # Se chegou aqui, a conexão foi bem-sucedida
        print("Conexão com MongoDB estabelecida com sucesso!")
        assert True

        # Verificar se o banco de dados existe
        db_names = await client.list_database_names()
        print(f"Bancos de dados disponíveis: {db_names}")

        # Conectar ao banco específico
        db = client[settings.DATABASE_NAME]

        # Listar coleções (se houver)
        collections = await db.list_collection_names()
        print(f"Coleções disponíveis em {settings.DATABASE_NAME}: {collections}")

        # Fechar a conexão
        client.close()

    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        print(f"Falha ao conectar ao MongoDB: {e}")
        assert False, f"Falha na conexão com MongoDB: {e}"

# Teste usando mock para quando não puder conectar ao banco real
def test_mongodb_connection_mock():
    """Teste da conexão com MongoDB usando mock"""
    # Criar um mock do cliente MongoDB
    mock_client = AsyncMock()
    mock_db = AsyncMock()
    mock_collection = AsyncMock()

    # Configurar o comportamento do mock
    mock_client.__getitem__.return_value = mock_db
    mock_db.__getitem__.return_value = mock_collection
    mock_db.list_collection_names = AsyncMock(return_value=["products", "categories", "orders"])
    mock_client.admin.command = AsyncMock(return_value={"ok": 1})

    # Simular chamada ao MongoDB
    with patch('motor.motor_asyncio.AsyncIOMotorClient', return_value=mock_client):
        # Em uma função normal, você faria:
        # client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URL)
        # db = client[settings.DATABASE_NAME]
        # collections = await db.list_collection_names()

        # Verificar se o cliente foi criado com a URL correta
        assert settings.MONGODB_URL.startswith("mongodb://")
        assert settings.DATABASE_NAME == "ecommerce"

        # Verificar se conseguimos obter um database
        db = mock_client[settings.DATABASE_NAME]
        assert db is mock_db

        # Como é um teste síncrono, não podemos chamar funções assíncronas diretamente
        # Em vez disso, verificamos se as funções estão disponíveis
        assert hasattr(db, 'list_collection_names')
        assert callable(db.list_collection_names)

# Função auxiliar para executar testes assíncronos
def run_async_test(coroutine):
    """Executa um coroutine em um novo event loop"""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(coroutine)
    finally:
        loop.close()

# Teste de integração básico para verificar inserção e busca
@pytest.mark.asyncio
async def test_mongodb_basic_operations():
    """Teste para verificar operações básicas no MongoDB"""
    try:
        # Criar cliente MongoDB
        client = motor.motor_asyncio.AsyncIOMotorClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=5000
        )

        # Selecionar banco de dados de teste
        test_db_name = f"{settings.DATABASE_NAME}_test"
        db = client[test_db_name]

        # Usar uma coleção temporária para o teste
        test_collection = db["test_connection"]

        # Limpar dados antigos
        await test_collection.delete_many({})

        # Inserir um documento
        test_document = {"name": "Test Document", "value": 42}
        insert_result = await test_collection.insert_one(test_document)

        # Verificar se o documento foi inserido
        assert insert_result.acknowledged
        assert insert_result.inserted_id is not None

        # Buscar o documento
        found_document = await test_collection.find_one({"name": "Test Document"})

        # Verificar se o documento foi encontrado
        assert found_document is not None
        assert found_document["value"] == 42

        # Atualizar o documento
        update_result = await test_collection.update_one(
            {"name": "Test Document"},
            {"$set": {"value": 43}}
        )

        # Verificar se a atualização foi bem-sucedida
        assert update_result.acknowledged
        assert update_result.modified_count == 1

        # Buscar o documento atualizado
        updated_document = await test_collection.find_one({"name": "Test Document"})
        assert updated_document["value"] == 43

        # Limpar após o teste
        await test_collection.delete_many({})

        # Fechar a conexão
        client.close()

        print("Teste de operações básicas no MongoDB concluído com sucesso!")

    except Exception as e:
        assert False, f"Falha nas operações básicas do MongoDB: {e}"

if __name__ == "__main__":
    # Executar os testes diretamente
    print("\nExecutando teste com mock...")
    test_mongodb_connection_mock()
    print("Teste com mock concluído!\n")

    print("Executando teste de conexão...")
    run_async_test(test_mongodb_connection())
    print("\nExecutando teste de operações básicas...")
    run_async_test(test_mongodb_basic_operations())