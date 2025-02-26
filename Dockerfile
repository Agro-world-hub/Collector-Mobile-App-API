FROM node:20-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    dumb-init \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

RUN chown -R node:node /usr/src/app

USER node

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "server.js"]
