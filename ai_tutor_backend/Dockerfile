# STAGE 1: BUILDER
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

# STAGE 2: PRODUCTION
FROM node:18-alpine AS production

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --chown=node:node --from=builder /usr/src/app/src ./src

USER node

EXPOSE 5000

CMD ["node", "src/server.js"]
