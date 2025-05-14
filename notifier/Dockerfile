FROM node:18

WORKDIR /app

COPY notify.js ../shared/config.js ./

RUN npm install amqplib

CMD ["node", "notify.js"]
