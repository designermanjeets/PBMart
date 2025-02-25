FROM node:14-alpine

WORKDIR /app/tenant

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8004

CMD ["npm", "start"] 