FROM node:7.5.0-alpine

WORKDIR /usr/src/app

COPY ./package.json ./index.html ./server.js ./

RUN npm install --loglevel warn --production

EXPOSE 8080

CMD [ "npm", "start" ]
