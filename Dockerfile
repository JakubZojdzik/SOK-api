FROM node:lts-alpine

WORKDIR /usr/app

COPY package.json ./
COPY package-lock.json ./

RUN npm install
# for production
# RUN npm ci --only=production

COPY . .

EXPOSE 8080

CMD [ "node", "index.js" ]