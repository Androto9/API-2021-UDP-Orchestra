FROM node:16.13

WORKDIR /opt/app

RUN npm install uuid --save

COPY src .

ENTRYPOINT ["node", "/opt/app/musician.js"]