FROM node:20-alpine
RUN apk add --no-cache curl
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 -G nodejs
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN chown -R nodejs:nodejs /usr/src/app
USER nodejs
EXPOSE 3003
CMD ["npm", "start"]
