import json
import os
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timedelta
import sys

class JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (datetime, timedelta)):
            return obj.isoformat()
        if isinstance(obj, ObjectId):
            return str(obj)
        return json.JSONEncoder.default(self, obj)

def get_mongodb_client():
    try:
        mongodb_url = os.environ.get('MONGODB_URL', 'mongodb://admin:admin123@mongodb:27017/')
        client = MongoClient(mongodb_url, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        return client
    except Exception as e:
        print(f"Erro na conexão MongoDB: {str(e)}", file=sys.stderr)
        raise

def get_order_details(order_id):
    """Busca detalhes do pedido e produtos relacionados"""
    try:
        print(f"Iniciando busca do pedido: {order_id}", file=sys.stderr)
        client = get_mongodb_client()

        db = client.ecommerce
        print("Conectado à base de dados ecommerce", file=sys.stderr)

        order_id_obj = ObjectId(order_id)
        order = db.orders.find_one({'_id': order_id_obj})
        print(f"Resultado da busca: {order}", file=sys.stderr)

        if not order:
            return None

        # Criar dicionário base com campos obrigatórios
        order_details = {
            'order_id': str(order['_id']),
            'date': order['date'],
            'total': order['total'],
            'product_ids': [str(pid) for pid in order.get('product_ids', [])]
        }

        # Adicionar campos opcionais se existirem
        if 'created_at' in order:
            order_details['created_at'] = order['created_at']
        if 'status' in order:
            order_details['status'] = order['status']
        if 'customer_name' in order:
            order_details['customer_name'] = order['customer_name']

        return order_details

    except Exception as e:
        print(f"Erro ao buscar pedido: {str(e)}", file=sys.stderr)
        raise

def generate_sales_report(order_details):
    """Gera relatório de vendas baseado no pedido"""
    try:
        client = get_mongodb_client()
        db = client.ecommerce

        # Métricas do pedido atual
        current_order_metrics = {
            'total_items': len(order_details.get('product_ids', [])),  # Mudado de 'products' para 'product_ids'
            'average_item_price': order_details['total'] / len(order_details.get('product_ids', [])) if order_details.get('product_ids') else 0,
            'order_date': order_details['date']
        }

        # Histórico de vendas (últimos 30 dias)
        thirty_days_ago = datetime.now() - timedelta(days=30)
        historical_orders = db.orders.find({
            'date': {'$gte': thirty_days_ago}
        })

        # Análise de tendências
        sales_trends = {
            'total_orders': 0,
            'total_revenue': 0,
            'avg_order_value': 0,
            'products_sold': {}
        }

        for order in historical_orders:
            sales_trends['total_orders'] += 1
            sales_trends['total_revenue'] += order['total']

            for product_id in order.get('product_ids', []):
                prod_id_str = str(product_id)
                if prod_id_str not in sales_trends['products_sold']:
                    sales_trends['products_sold'][prod_id_str] = 0
                sales_trends['products_sold'][prod_id_str] += 1

        if sales_trends['total_orders'] > 0:
            sales_trends['avg_order_value'] = sales_trends['total_revenue'] / sales_trends['total_orders']

        return {
            'current_order': current_order_metrics,
            'trends': sales_trends
        }
    except Exception as e:
        print(f"Erro ao gerar relatório: {str(e)}", file=sys.stderr)
        raise


def send_notifications(order_details, sales_report):
    """Simula o envio de notificações"""
    notifications = []

    # Dados do cliente (podem ser anônimos para pedidos sem customer_name)
    customer_name = order_details.get('customer_name', 'Cliente')

    # Notificação para o cliente
    customer_notification = {
        'type': 'CUSTOMER_EMAIL',
        'recipient': customer_name,
        'subject': f"Pedido #{order_details['order_id']} processado",
        'message': f"Olá {customer_name},\n\n" \
                  f"Seu pedido foi processado com sucesso!\n" \
                  f"Total: R${order_details['total']:.2f}\n" \
                  f"Status: {order_details.get('status', 'processado')}"
    }
    notifications.append(customer_notification)

    # Alerta para equipe de vendas (apenas para pedidos acima da média)
    if order_details['total'] > sales_report['trends']['avg_order_value']:
        sales_team_notification = {
            'type': 'SALES_TEAM_ALERT',
            'recipient': 'sales_team',
            'subject': 'Pedido de Alto Valor Processado',
            'message': f"Pedido #{order_details['order_id']} processado com valor acima da média:\n" \
                      f"Valor: R${order_details['total']:.2f}\n" \
                      f"Cliente: {customer_name}"
        }
        notifications.append(sales_team_notification)

    return notifications

def process_order(event, context):
    try:
        print("Iniciando processamento", file=sys.stderr)
        order_id = event.get('order_id')

        if not order_id:
            raise ValueError("order_id não fornecido no evento")

        # Buscar detalhes do pedido
        order_details = get_order_details(order_id)
        if not order_details:
            return {
                'statusCode': 404,
                'body': json.dumps({
                    'error': f"Pedido {order_id} não encontrado"
                })
            }

        try:
            # Gerar relatório de vendas
            sales_report = generate_sales_report(order_details)

            # Enviar notificações
            notifications = send_notifications(order_details, sales_report)

            # Retornar resposta completa
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'message': 'Pedido processado com sucesso',
                    'order_details': order_details,
                    'sales_report': sales_report,
                    'notifications': notifications
                }, cls=JSONEncoder)
            }
        except Exception as e:
            print(f"Erro no processamento: {str(e)}", file=sys.stderr)
            # Se houver erro no processamento adicional, pelo menos retorna os detalhes do pedido
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'message': 'Pedido encontrado, mas houve erro no processamento adicional',
                    'error_details': str(e),
                    'order_details': order_details
                }, cls=JSONEncoder)
            }

    except Exception as e:
        print(f"Erro no processamento: {str(e)}", file=sys.stderr)
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e)
            })
        }