FROM node:20-slim

# Instala dependências básicas para ferramentas nativas
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instala dependências do Node
COPY package*.json ./
RUN npm ci --only=production

# Copia código da aplicação
COPY . .

# Cria diretórios de dados padrão
RUN mkdir -p /app/data/users /app/data/alpha_cache /app/data/preview_cache /app/config

# Define variáveis de ambiente padrão para container
ENV PORT=3000
ENV NODE_ENV=production
ENV DATA_DIR=/app/data
ENV CONFIG_DIR=/app/config

EXPOSE 3000

CMD ["node", "server.js"]

