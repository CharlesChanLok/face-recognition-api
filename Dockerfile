FROM node:10.14.2

RUN mkdir -p /home/node/face-recognition-api
WORKDIR /home/node/face-recognition-api

COPY package.json .
RUN npm install

COPY . .

CMD ["npm", "run dev"]
