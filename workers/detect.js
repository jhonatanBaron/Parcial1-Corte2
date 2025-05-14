/*const amqp = require('amqplib');
const { RABBITMQ_URL } = require('../shared/config');

(async () => {
  const conn = await amqp.connect(RABBITMQ_URL);
  const ch = await conn.createChannel();

  await ch.prefetch(1);
  await ch.assertQueue('detect');
  await ch.assertExchange('processed_images', 'fanout');

  ch.consume('detect', async (msg) => {
    const { id, imagePath } = JSON.parse(msg.content.toString());

    console.log(`Detected content in ${imagePath}`);
    // Simulación detección
    await new Promise((r) => setTimeout(r, 1000));

    ch.publish('processed_images', '', Buffer.from(JSON.stringify({ id, imagePath })));
    ch.ack(msg);
  });
})();*/
// photo-pipeline/workers/detect.js

const amqp = require('amqplib');
const path = require('path');
const { RABBITMQ_URL } = require('../shared/config');

async function start() {
  const conn = await amqp.connect(RABBITMQ_URL);
  const channel = await conn.createChannel();
  await channel.assertQueue('detect', { durable: true });
  await channel.assertExchange('processed_images', 'fanout', { durable: true });
  await channel.prefetch(1);

  console.log('🔍 [detect] Worker esperando tareas...');

  channel.consume('detect', async (msg) => {
    const content = JSON.parse(msg.content.toString());

    try {
      // Simulación de análisis de contenido
      const result = {
        ...content,
        detected: 'safe', // o 'nsfw', etc.
        timestamp: new Date()
      };

      // Publicar al exchange
      channel.publish('processed_images', '', Buffer.from(JSON.stringify(result)));

      console.log(`✅ [detect] Procesada y notificada: ${path.basename(content.filePath)}`);
      channel.ack(msg);
    } catch (error) {
      console.error('❌ [detect] Error:', error);
      channel.nack(msg, false, true);
    }
  });
}

start();
