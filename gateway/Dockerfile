FROM node:16-alpine

WORKDIR /app/gateway

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8000

CMD ["npm", "start"] 