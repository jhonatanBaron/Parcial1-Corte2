//module.exports = {
//    RABBITMQ_URL: 'amqp://rabbitmq',
  //};

// photo-pipeline/shared/config.js

const path = require('path');

module.exports = {
  RABBITMQ_URL: process.env.RABBITMQ_URL || 'amqp://rabbitmq',
  IMAGE_DIR: path.resolve(__dirname, '../images')
};
