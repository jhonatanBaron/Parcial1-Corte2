//const amqp = require('amqplib');
//const sharp = require('sharp');
//const fs = require('fs');
//const path = require('path');
//onst { RABBITMQ_URL } = require('../shared/config');

/*(async () => {
  const conn = await amqp.connect(RABBITMQ_URL);
  const ch = await conn.createChannel();

  await ch.prefetch(1);
  await ch.assertQueue('resize');

  ch.consume('resize', async (msg) => {
    const { id, imagePath } = JSON.parse(msg.content.toString());
    const output = `${imagePath}_resized.jpg`;

    await sharp(imagePath).resize(800).toFile(output);
    console.log(`Resized: ${output}`);

    // Enviar a watermark
    await ch.assertQueue('watermark');
    ch.sendToQueue('watermark', Buffer.from(JSON.stringify({ id, imagePath: output })));

    ch.ack(msg);
  });
})();
*/
// photo-pipeline/workers/resize.js

const amqp = require('amqplib');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { IMAGE_DIR, RABBITMQ_URL } = require('../shared/config');

async function start() {
  const conn = await amqp.connect(RABBITMQ_URL);
  const channel = await conn.createChannel();
  await channel.assertQueue('resize', { durable: true });
  await channel.prefetch(1);

  console.log('📦 [resize] Worker esperando tareas...');

  channel.consume('resize', async (msg) => {
    const content = JSON.parse(msg.content.toString());
    const outputPath = path.join(IMAGE_DIR, `resized-${path.basename(content.filePath)}`);

    try {
      await sharp(content.filePath)
        .resize(800)
        .toFile(outputPath);

      content.filePath = outputPath;

      channel.sendToQueue('watermark', Buffer.from(JSON.stringify(content)), { persistent: true });

      console.log(`✅ [resize] Procesada: ${outputPath}`);
      channel.ack(msg);
    } catch (error) {
      console.error('❌ [resize] Error:', error);
      channel.nack(msg, false, true); // reintenta
    }
  });
}

start();
