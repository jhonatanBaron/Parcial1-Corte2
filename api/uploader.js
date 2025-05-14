const amqp = require('amqplib');
const { RABBITMQ_URL } = require('../photo-pipeline/shared/config');

exports.sendToQueue = async (id, imagePath) => {
  const conn = await amqp.connect(RABBITMQ_URL);
  const ch = await conn.createChannel();

  await ch.assertQueue('resize');
  await ch.sendToQueue('resize', Buffer.from(JSON.stringify({ id, imagePath })));

  await ch.close();
  await conn.close();
};
