const express = require('express');
const multer = require('multer');
const amqp = require('amqplib');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const { updateStatus, getStatus } = require('./statusStore');
const { RABBITMQ_URL, IMAGE_DIR } = require('../shared/config');

const app = express();
const port = 3000;

// Configuración de multer para almacenar imágenes en disco
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, IMAGE_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Conexión a RabbitMQ
let channel;

async function connectRabbitMQ() {
  const connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();

  // Crear colas si no existen
  await channel.assertQueue('resize', { durable: true });
  await channel.assertQueue('watermark', { durable: true });
  await channel.assertQueue('detect', { durable: true });
}

connectRabbitMQ().then(() => {
  console.log('✅ Conectado a RabbitMQ');
}).catch(console.error);

// Endpoint para subir imagen
app.post('/upload', upload.single('image'), async (req, res) => {
  const id = uuidv4();
  const filePath = path.join(IMAGE_DIR, req.file.filename);

  const message = {
    id,
    filePath
  };

  // Enviar mensaje a la primera cola del pipeline
  channel.sendToQueue('resize', Buffer.from(JSON.stringify(message)), {
    persistent: true
  });

  // Registrar el estado inicial
  updateStatus(id, {
    status: 'uploaded',
    file: req.file.filename,
    steps: {
      resize: 'pending',
      watermark: 'pending',
      detect: 'pending'
    }
  });

  res.json({ id, message: 'Imagen recibida y en procesamiento' });
});

// Endpoint para consultar el estado
app.get('/status/:id', (req, res) => {
  const id = req.params.id;
  const status = getStatus(id);
  if (status) {
    res.json(status);
  } else {
    res.status(404).json({ error: 'ID no encontrado' });
  }
});

app.listen(port, () => {
  console.log(`🚀 API corriendo en http://localhost:${port}`);
});
