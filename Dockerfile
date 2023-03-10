FROM node:lts-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install
# for production
# RUN npm ci --only=production

COPY . .

EXPOSE 8080

CMD [ "node", "index.js" ]