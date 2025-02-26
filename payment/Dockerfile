FROM node:18-alpine

WORKDIR /app/payment

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8006

CMD ["npm", "start"] 