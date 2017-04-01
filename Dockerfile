FROM node:7.6.0-alpine

WORKDIR /usr/src/app

COPY ./ ./

RUN npm install --loglevel warn --production

EXPOSE 8080

CMD [ "npm", "start" ]
