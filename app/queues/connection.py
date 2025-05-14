import pika
import json
import os

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "rabbitmq")

_connection = None
_channel = None

def get_channel():
    global _connection, _channel
    if _channel is None:
        _connection = pika.BlockingConnection(
            pika.ConnectionParameters(host=RABBITMQ_HOST)
        )
        _channel = _connection.channel()
        # Declarar las colas al momento de abrir el canal
        for queue in ["resize", "watermark", "detect"]:
            _channel.queue_declare(queue=queue, durable=True)
    return _channel

def send_to_resize_queue(data):
    channel = get_channel()
    channel.basic_publish(
        exchange='',
        routing_key='resize',
        body=json.dumps(data),
        properties=pika.BasicProperties(delivery_mode=2)
    )
