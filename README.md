# Projeto Full Stack E-commerce

## Visão Geral

Este é um aplicativo de e-commerce full stack desenvolvido com FastAPI, MongoDB, ReactJS e AWS (utilizando LocalStack para S3). A aplicação permite o gerenciamento de produtos, categorias e pedidos com funcionalidade CRUD completa, dashboard para KPIs, upload de imagens para o S3 e funções serverless.

## Arquitetura

### Backend

- **FastAPI**: Framework API RESTful para Python
- **MongoDB**: Banco de dados NoSQL para armazenar dados de produtos, categorias e pedidos
- **Pydantic**: Validação e serialização de dados

### Frontend

- **ReactJS**: Biblioteca JavaScript para construção da interface de usuário
- **Material UI**: Framework UI React para design responsivo
- **Storybook**: Ferramenta para documentação de componentes UI

### Integração com Cloud

- **LocalStack**: Stack AWS local para simular serviços como S3
- **Serverless Framework**: Para gerenciar e implantar funções AWS Lambda

### Docker

- Docker e Docker Compose para containerização e implantação local

## Capturas de Tela

### Aplicação Frontend

<img width="1440" alt="Captura de Tela 2025-02-24 às 19 53 18" src="https://github.com/user-attachments/assets/49c6f644-bc60-46e8-8ef3-4a717960f2d3" />

### Página de Produtos

<img width="1440" alt="Captura de Tela 2025-02-24 às 19 53 32" src="https://github.com/user-attachments/assets/3a3ea241-d0ac-43b6-9058-09951b2463f2" />

### Página de Categorias

<img width="1440" alt="Captura de Tela 2025-02-24 às 19 53 45" src="https://github.com/user-attachments/assets/952d6630-4031-4b9f-b201-d20ef6372784" />

### Página de Pedidos

<img width="1439" alt="Captura de Tela 2025-02-24 às 19 53 58" src="https://github.com/user-attachments/assets/fe41655a-6e97-4ee0-aa97-a4af01a1e52f" />

### Documentação Storybook

<img width="1439" alt="Captura de Tela 2025-02-24 às 19 56 38" src="https://github.com/user-attachments/assets/166c32d9-c043-434c-aaaf-c27096f2b5f3" />
<img width="1440" alt="Captura de Tela 2025-02-24 às 19 56 51" src="https://github.com/user-attachments/assets/81dcff42-6f62-4082-b7d4-700f5d6683a3" />

## Começando

### Pré-requisitos

- Docker e Docker Compose
- Git

### Instalação

1. Clone o repositório:

```bash
git clone https://github.com/seuusuario/projeto-ecommerce.git
cd projeto-ecommerce/projeto-ecommerce/
```

2. Inicie os containers:

```bash
docker-compose up -d
```

3. Aguarde até que todos os serviços iniciem corretamente (isso pode levar alguns minutos).

### Inicializando a Aplicação

Após os containers estarem em execução, execute os seguintes comandos para inicializar o banco de dados, o bucket S3 e executar testes:

1. Alimente o banco de dados com dados de exemplo:

### Script de População do Banco de Dados

Para gerar dados de teste para a aplicação, utilize o script de seed através do Docker:

```bash
docker exec -it projeto-ecommerce-backend-1 python /app/scripts/seed.py [opções]
```

## Opções Disponíveis

| Opção                 | Descrição                                          | Valor Padrão |
| --------------------- | -------------------------------------------------- | ------------ |
| `--categories NÚMERO` | Define o número de categorias a serem criadas      | 10           |
| `--products NÚMERO`   | Define o número de produtos a serem criados        | 50           |
| `--orders NÚMERO`     | Define o número de pedidos a serem criados         | 100          |
| `--clear`             | Limpa os dados existentes antes de popular o banco | Falso        |

### Exemplos de Uso

### Gerar dados com valores padrão:

```bash
docker exec -it projeto-ecommerce-backend-1 python /app/scripts/seed.py
```

### Gerar um conjunto maior de dados:

```bash
docker exec -it projeto-ecommerce-backend-1 python /app/scripts/seed.py --categories 20 --products 100 --orders 200
```

### Limpar dados existentes e gerar um conjunto pequeno:

```bash
docker exec -it projeto-ecommerce-backend-1 python /app/scripts/seed.py --categories 5 --products 25 --orders 50 --clear
```

## Observações

- O script gera dados aleatórios em português do Brasil usando a biblioteca Faker
- São criadas categorias, produtos com imagens aleatórias e pedidos associados a esses produtos
- Os pedidos gerados têm datas distribuídas nos últimos 6 meses
- Os preços dos produtos variam entre R$10,00 e R$1.000,00

2. Inicialize o bucket S3 para armazenamento de imagens:

```bash
docker exec -it projeto-ecommerce-backend-1 python /app/scripts/init-s3.py
```

3. Execute testes do backend:

```bash
docker exec -it projeto-ecommerce-backend-1 pytest tests/
```

4. Implante a função Lambda:

```bash
docker exec -it projeto-ecommerce-lambda-1 sh -c "cd /var/task && python deploy.py"
```

5. Crie a função Lambda no LocalStack:

```bash
docker exec -it projeto-ecommerce-lambda-1 sh -c "aws --endpoint-url=http://localstack:4566 lambda create-function \
    --function-name hub-xp-orders-dev-processOrder \
    --runtime python3.9 \
    --role arn:aws:iam::000000000000:role/lambda-role \
    --handler handler.process_order \
    --zip-file fileb://function.zip"
```

6. Execute testes do frontend:

```bash
docker exec -it projeto-ecommerce-frontend-1 npm test
```

## Acessando a Aplicação

Quando todos os serviços estiverem em execução e inicializados:

- **Frontend**: http://localhost:3000
- **API Backend**: http://localhost:8000
- **Documentação da API**: http://localhost:8000/docs
- **Storybook**: http://localhost:6006

## Estrutura do Projeto

```
projeto-ecommerce/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   ├── scripts/
│   │   ├── seed.py
│   │   └── init-s3.py
│   ├── tests/
│   └── Dockerfile
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── stories/
│   ├── .storybook/
│   └── Dockerfile
├── lambda/
│   ├── functions/
│   ├── deploy.py
│   ├── handler.py
│   └── Dockerfile
│   └── serverless.yml
└── docker-compose.yml
```

## Endpoints da API

### Produtos

- `POST /api/v1/products/`: Criar um novo produto passando a imagem como url
- `GET /api/v1/products/`: Listar todos os produtos
- `POST /api/v1/products/with-image/`: Criar um novo produto enviando a imagem para o S3
- `GET /api/v1/products/{id}`: Listar um produto
- `PUT /api/v1/products/{id}`: Atualizar um produto
- `DELETE /api/v1/products/{id}`: Excluir um produto

### Categorias

- `GET /api/v1/categories`: Listar todas as categorias
- `POST /api/v1/categories`: Criar uma nova categoria
- `GET /api/v1/categories/{id}`: Obter uma categoria específica
- `PUT /api/v1/categories/{id}`: Atualizar uma categoria
- `DELETE /api/v1/categories/{id}`: Excluir uma categoria

### Pedidos

- `GET /api/v1/orders`: Listar todos os pedidos
- `POST /api/v1/orders`: Criar um novo pedido
- `GET /api/v1/orders/{id}`: Obter um pedido específico
- `PUT /api/v1/orders/{id}`: Atualizar um pedido
- `DELETE /api/v1/orders/{id}`: Excluir um pedido
- `GET /api/v1/orders/process-order{id}`: Lambda que gera informações do pedido, sales report, trends, notifacions

### Dashboard

- `GET /api/dashboard/sales`: Obter dados de vendas com filtros

## Função Lambda

O projeto inclui uma função Lambda para processar pedidos de forma assíncrona:

**Nome da Função**: `hub-xp-orders-dev-processOrder`

**Trigger**: Atualmente é ativada manualmente para demonstração, mas poderia ser configurada com diversos gatilhos como:

- Eventos do DynamoDB quando novos pedidos são inseridos
- API Gateway para acionar via endpoint HTTP após finalização de compra
- SQS para processamento de fila de pedidos
- Eventos programados via CloudWatch
- SNS após confirmação de pedido
- Kinesis para processamento em tempo real

## **Propósito**: Processa dados de pedidos, calcula métricas e pode ser estendida. Simula envio de notificações para o time de vendas quando um pedido é acima da média e simula a notificação para o cliente. Como o objetivo era entregar um MVP, optei por fazer dessa maneira, mas isso pode ser melhorado em versões futuras.

<img width="1362" alt="Captura de Tela 2025-02-24 às 20 08 57" src="https://github.com/user-attachments/assets/aff0144e-c487-4cba-bdfc-d042ff8310f9" />

## Componentes Storybook

O projeto inclui componentes UI documentados usando Storybook:

1. **DataTable**: Componente de tabela reutilizável para listar entidades
2. **EntityForm**: Componente de formulário para criar e editar entidades

Para visualizar a documentação do Storybook abra http://localhost:6006 no seu navegador.

## Solução de Problemas

### Problemas Comuns

1. **Containers Docker falham ao iniciar**:

   - Verifique se as portas já estão em uso
   - Certifique-se de que o Docker tenha recursos suficientes alocados

2. **Problemas de conexão com MongoDB**:

   - Verifique se o container do MongoDB está em execução
   - Verifique a string de conexão na configuração do backend

3. **Falhas no upload para S3**:

   - Certifique-se de que o LocalStack esteja inicializado corretamente
   - Verifique se o bucket S3 foi criado com sucesso

4. **Frontend não conecta ao backend**:
   - Verifique a configuração CORS
   - Verifique a URL base da API na configuração do frontend

### Logs

Para verificar logs para solução de problemas:

```bash
# Logs do Backend
docker logs -f projeto-ecommerce-backend-1

# Logs do Frontend
docker logs -f projeto-ecommerce-frontend-1

# Logs do LocalStack
docker logs -f projeto-ecommerce-localstack-1

# Logs do Lambda
docker logs -f projeto-ecommerce-lambda-1
```
