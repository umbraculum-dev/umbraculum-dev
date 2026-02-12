FROM node:20-slim

WORKDIR /app

# Prisma engines may require OpenSSL at runtime.
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

# Install dependencies first (better caching)
COPY package.json ./
RUN npm install

# Copy source
COPY tsconfig.json ./
COPY src ./src

EXPOSE 4000

CMD ["npm", "run", "dev"]

