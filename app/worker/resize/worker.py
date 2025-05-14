import pika, json, os
from app.utils.image_processing import resize_image

def callback(ch, method, properties, body):
    data = json.loads(body)
    output_path = data["path"].replace(".jpg", "_resized.jpg")
    resize_image(data["path"], output_path)

    data["path"] = output_path
    ch.basic_ack(delivery_tag=method.delivery_tag)

    # Enviar a siguiente cola
    channel.basic_publish(
        exchange='',
        routing_key='watermark',
        body=json.dumps(data),
        properties=pika.BasicProperties(delivery_mode=2)
    )

connection = pika.BlockingConnection(pika.ConnectionParameters(host='rabbitmq'))
channel = connection.channel()
channel.queue_declare(queue='resize', durable=True)
channel.basic_qos(prefetch_count=1)
channel.basic_consume(queue='resize', on_message_callback=callback)
print("Resize worker running...")
channel.start_consuming()
