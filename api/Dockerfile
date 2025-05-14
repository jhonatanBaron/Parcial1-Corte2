# api/Dockerfile

# Imagen base oficial de Node.js
FROM node:18-alpine

# Crear y usar el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiar package.json y package-lock.json (si existe)
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código fuente de la API
COPY . .

# Exponer el puerto en el que correrá la API (ej: 3000)
EXPOSE 3000

# Comando para ejecutar la API
CMD ["node", "index.js"]
