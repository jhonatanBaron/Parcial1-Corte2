##FROM node:18
##WORKDIR /app
##COPY . .
##RUN npm install
##CMD ["node", "resize.js"]
# photo-pipeline/workers/Dockerfile

FROM node:18

WORKDIR /app

COPY ../shared ./shared
COPY ./resize.js ./watermark.js ./detect.js ./
COPY ../package.json .

RUN npm install sharp amqplib

CMD ["node", "resize.js"]
