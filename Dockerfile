FROM node:18-slim
# Installation de FFmpeg nécessaire pour le flux audio
RUN apt-get update && apt-get install -y ffmpeg
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "index.js"]
