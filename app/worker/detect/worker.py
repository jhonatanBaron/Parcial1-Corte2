import pika, json, os
from app.utils.image_processing import detect_content
from app.events.publisher import publish_processed_event

def callback(ch, method, properties, body):
    data = json.loads(body)
    data["content_status"] = detect_content(data["path"])

    # Guardar status en archivo
    status_path = f"uploads/{data['id']}_status.json"
    with open(status_path, "w") as f:
        json.dump(data, f)

    # Publicar evento
    publish_processed_event(data)

    ch.basic_ack(delivery_tag=method.delivery_tag)

connection = pika.BlockingConnection(pika.ConnectionParameters(host='rabbitmq'))
channel = connection.channel()
channel.queue_declare(queue='detect', durable=True)
channel.basic_qos(prefetch_count=1)
channel.basic_consume(queue='detect', on_message_callback=callback)
print("Detect worker running...")
channel.start_consuming()
