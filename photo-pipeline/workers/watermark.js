/*const amqp = require('amqplib');
const Jimp = require('jimp');
const { RABBITMQ_URL } = require('../shared/config');

(async () => {
  const conn = await amqp.connect(RABBITMQ_URL);
  const ch = await conn.createChannel();

  await ch.prefetch(1);
  await ch.assertQueue('watermark');

  ch.consume('watermark', async (msg) => {
    const { id, imagePath } = JSON.parse(msg.content.toString());
    const image = await Jimp.read(imagePath);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);

    image.print(font, 10, 10, 'MyBrand');
    const watermarkedPath = imagePath.replace('.jpg', '_watermarked.jpg');
    await image.writeAsync(watermarkedPath);

    // Enviar a detección
    await ch.assertQueue('detect');
    ch.sendToQueue('detect', Buffer.from(JSON.stringify({ id, imagePath: watermarkedPath })));

    ch.ack(msg);
  });
})();
*/
// photo-pipeline/workers/watermark.js

const amqp = require('amqplib');
const sharp = require('sharp');
const path = require('path');
const { IMAGE_DIR, RABBITMQ_URL } = require('../shared/config');

async function start() {
  const conn = await amqp.connect(RABBITMQ_URL);
  const channel = await conn.createChannel();
  await channel.assertQueue('watermark', { durable: true });
  await channel.prefetch(1);

  console.log('💧 [watermark] Worker esperando tareas...');

  channel.consume('watermark', async (msg) => {
    const content = JSON.parse(msg.content.toString());
    const outputPath = path.join(IMAGE_DIR, `wm-${path.basename(content.filePath)}`);

    try {
      await sharp(content.filePath)
        .composite([{ input: Buffer.from('<svg><text x="10" y="50" font-size="40">Marca</text></svg>'), gravity: 'southeast' }])
        .toFile(outputPath);

      content.filePath = outputPath;

      channel.sendToQueue('detect', Buffer.from(JSON.stringify(content)), { persistent: true });

      console.log(`✅ [watermark] Aplicada: ${outputPath}`);
      channel.ack(msg);
    } catch (error) {
      console.error('❌ [watermark] Error:', error);
      channel.nack(msg, false, true);
    }
  });
}

start();
