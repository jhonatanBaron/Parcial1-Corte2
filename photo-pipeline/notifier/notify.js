/*const amqp = require('amqplib');
const { RABBITMQ_URL } = require('../shared/config');

(async () => {
  const conn = await amqp.connect(RABBITMQ_URL);
  const ch = await conn.createChannel();

  await ch.assertExchange('processed_images', 'fanout');
  const q = await ch.assertQueue('', { exclusive: true });
  ch.bindQueue(q.queue, 'processed_images', '');

  ch.consume(q.queue, (msg) => {
    const data = JSON.parse(msg.content.toString());
    console.log(`✅ Imagen procesada: ${data.id} - ${data.imagePath}`);
  }, { noAck: true });
})();
*/

const amqp = require('amqplib');
const { RABBITMQ_URL } = require('../shared/config');

async function start() {
  const conn = await amqp.connect(RABBITMQ_URL);
  const channel = await conn.createChannel();

  const exchange = 'processed_images';
  await channel.assertExchange(exchange, 'fanout', { durable: true });

  const q = await channel.assertQueue('', { exclusive: true });
  await channel.bindQueue(q.queue, exchange, '');

  console.log('📡 Notificador esperando eventos en', q.queue);

  channel.consume(q.queue, (msg) => {
    if (msg.content) {
      const event = JSON.parse(msg.content.toString());
      console.log('🔔 Imagen procesada completamente:', event);
    }
  }, { noAck: true });
}

start().catch(console.error);

