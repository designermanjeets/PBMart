FROM node:18-alpine

WORKDIR /app/notification

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8007

CMD ["npm", "start"]