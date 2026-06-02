FROM node:18-slim
# Installation de ffmpeg et des dépendances nécessaires
RUN apt-get update && apt-get install -y ffmpeg python3 build-essential
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "index.js"]
