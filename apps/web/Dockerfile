FROM node:20-slim

WORKDIR /app

# Install deps first (better caching)
COPY package.json ./
COPY package-lock.json ./
COPY scripts ./scripts
RUN npm install

# Copy source
COPY next-env.d.ts ./
COPY tsconfig.json ./
COPY next.config.js ./
COPY app ./app

EXPOSE 3000

CMD ["npm", "run", "dev"]
