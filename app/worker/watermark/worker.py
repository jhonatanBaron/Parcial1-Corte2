import pika, json
from app.utils.image_processing import apply_watermark

def callback(ch, method, properties, body):
    data = json.loads(body)
    output_path = data["path"].replace("_resized", "_watermarked")
    apply_watermark(data["path"], output_path)

    data["path"] = output_path
    ch.basic_ack(delivery_tag=method.delivery_tag)

    channel.basic_publish(
        exchange='',
        routing_key='detect',
        body=json.dumps(data),
        properties=pika.BasicProperties(delivery_mode=2)
    )

connection = pika.BlockingConnection(pika.ConnectionParameters(host='rabbitmq'))
channel = connection.channel()
channel.queue_declare(queue='watermark', durable=True)
channel.basic_qos(prefetch_count=1)
channel.basic_consume(queue='watermark', on_message_callback=callback)
print("Watermark worker running...")
channel.start_consuming()
