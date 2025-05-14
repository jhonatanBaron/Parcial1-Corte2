import pika
import json
import os

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "rabbitmq")

def publish_processed_event(data):
    connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST))
    channel = connection.channel()

    channel.exchange_declare(exchange='processed_images', exchange_type='fanout', durable=True)
    channel.basic_publish(
        exchange='processed_images',
        routing_key='',
        body=json.dumps(data)
    )
    connection.close()
