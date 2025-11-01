FROM node:20-alpine
RUN apk add --no-cache curl
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /usr/src/app
# create logs dir for winston and ensure correct ownership
RUN mkdir -p /usr/src/app/logs && chown -R nodejs:nodejs /usr/src/app/logs
USER nodejs
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:5000/api/ping || exit 1
CMD ["npm", "start"]
