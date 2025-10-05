FROM node:20
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
ENV HOST=0.0.0.0
ENV NODE_ENV=development
CMD [ "npm", "run", "dev" ]
