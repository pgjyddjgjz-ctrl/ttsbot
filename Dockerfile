FROM node:18-slim

# Installation de FFmpeg et outils de build
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copie et installation propre
COPY package*.json ./
RUN npm install --omit=dev

COPY . .

CMD ["node", "index.js"]
