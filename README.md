
# 🖼️ Photo Pipeline - Procesamiento Distribuido de Imágenes

Una plataforma de publicación fotográfica recibe miles de imágenes diarias. Para mejorar la experiencia del usuario, las imágenes son procesadas en un pipeline distribuido: **redimensionado**, **marca de agua** y **detección de contenido**.

Este sistema está diseñado para ser **escalable, tolerante a fallos y asincrónico**, usando FastAPI, RabbitMQ y Docker.

---

## 🚀 Cómo ejecutar el proyecto

Requisitos:

- Docker
- Docker Compose

Pasos:

```bash
git clone https://github.com/jhonatanBaron/photo-pipeline.git
cd photo-pipeline
docker-compose up --build
```

Una vez iniciados los contenedores:

- API disponible en: [http://localhost:8000/docs](http://localhost:8000/docs)
- RabbitMQ Management: [http://localhost:15672](http://localhost:15672)
  - Usuario: `guest`
  - Contraseña: `guest`

---

## 📸 Cómo usar la API

### Subir una imagen

```bash
curl -X POST http://localhost:8000/upload/   -F "file=@/ruta/a/tu/imagen.jpeg"
```

### Consultar estado de procesamiento

```bash
curl http://localhost:8000/status/{cv_id}
```

---

## 🧱 Arquitectura

### 1. Procesamiento distribuido con colas (RabbitMQ)

- **Redimensionado**
- **Marca de agua**
- **Detección de contenido**

Cada etapa es un *worker* independiente que consume de una cola:

| Worker         | Cola         | Tipo       |
|----------------|--------------|------------|
| Resizer        | `resize`     | Work Queue |
| Watermarker    | `watermark`  | Work Queue |
| Detector       | `detect`     | Work Queue |

🔁 Esto permite que los procesos sean paralelos, desacoplados y tolerantes a fallos.

---

### 2. RabbitMQ – Work Queues + Prefetch

- Se configura `channel.basic_qos(prefetch_count=1)` para que cada worker reciba un solo mensaje a la vez.  
- Esto **evita sobrecarga** y asegura un buen balance de carga.

---

### 3. RabbitMQ – Publish/Subscribe (fanout)

- Cuando una imagen es procesada completamente, se publica un evento en el **exchange `processed_images`** de tipo `fanout`.

Esto permite que múltiples sistemas escuchen el evento sin afectar la lógica principal, por ejemplo:

- Servicio de notificaciones
- Servicio de almacenamiento permanente
- Monitoreo y logs

---

### 4. Escalabilidad y réplicas

Los workers son independientes. Podemos escalar fácilmente con:

```yaml
    deploy:
      replicas: 3
```

Esto permite procesar muchas imágenes en paralelo sin cambiar la lógica de la API.

| Worker      | Réplicas sugeridas | Justificación                      |
|-------------|--------------------|-----------------------------------|
| resize      | 3                  | Operación común en casi todas las imágenes |
| watermark   | 2                  | Moderadamente intensivo            |
| detect      | 2                  | Puede usar modelos pesados         |

---

### 5. Manejo de errores y reintentos

- Si un worker falla, **RabbitMQ no hace `ack`**, y el mensaje se reenvía automáticamente.
- Se puede extender con `dead-letter-exchanges` o colas de reintento si se requiere.

---

### 6. Persistencia y consistencia

- Las colas de RabbitMQ están configuradas como `durable`, y los mensajes se publican con `delivery_mode=2` (persistente).
- Esto asegura que **si un contenedor se reinicia**, los mensajes no se pierden.

| Elemento     | Tipo de persistencia | Justificación                 |
|--------------|----------------------|-------------------------------|
| RabbitMQ     | Disco (`durable`)    | Consistencia ante fallos      |
| Archivos     | Volumen de Docker    | Evita pérdida entre reinicios |

---

## 📂 Estructura del proyecto

```
jhona@jhona:~/Escritorio/photo-pipeline$ tree
.
├── app
│   ├── api
│   │   ├── __pycache__
│   │   │   ├── status.cpython-310.pyc
│   │   │   └── upload.cpython-310.pyc
│   │   ├── status.py
│   │   └── upload.py
│   ├── events
│   │   └── publisher.py
│   ├── main.py
│   ├── __pycache__
│   │   └── main.cpython-310.pyc
│   ├── queues
│   │   ├── connection.py
│   │   └── __pycache__
│   │       └── connection.cpython-310.pyc
│   ├── schemas
│   │   └── image.py
│   ├── utils
│   │   └── image_processing.py
│   └── worker
│       ├── detect
│       │   └── worker.py
│       ├── resize
│       │   └── worker.py
│       └── watermark
│           └── worker.py
├── docker-compose.yml
├── Dockerfile
├── readme_evidencias
│   ├── Imagen pegada (2).png
│   ├── Imagen pegada (3).png
│   └── Imagen pegada.png
├── README.md
├── requirements.txt
├── tests
│   └── test_api.py
└── uploads

```

---


## 🧑‍💻 Autor

Desarrollado por Jhonatan Baron 