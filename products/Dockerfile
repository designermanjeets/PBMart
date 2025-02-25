FROM node:16

WORKDIR /app/products

# Copy package files
COPY package*.json ./

# Clean install all dependencies
RUN rm -rf node_modules
RUN npm cache clean --force
RUN npm install

# Install specific versions of problematic packages
RUN npm install axios@0.21.4 --save
RUN npm install bcryptjs@2.4.3 --save
RUN npm install joi@17.9.2 --save

# Copy application code
COPY . .

EXPOSE 8002

CMD ["npm", "start"]