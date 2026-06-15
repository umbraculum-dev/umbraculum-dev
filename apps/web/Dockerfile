FROM node:20-slim

WORKDIR /app

# Dev-only image. Compose bind-mounts ./apps/web and runs `npm ci` at container
# start while ../../packages/* are mounted for file: workspace links. Do not
# run npm ci in this Dockerfile: an isolated apps/web build context cannot
# resolve those links and npm reports a false package-lock.json sync failure.

EXPOSE 3000

CMD ["npm", "run", "dev"]
