FROM node:16-alpine

WORKDIR /app/customer

# Copy all code first
COPY . .

# Clean install all dependencies
RUN rm -rf node_modules
RUN npm cache clean --force
RUN npm install
# Explicitly remove bcrypt and install bcryptjs
RUN npm uninstall bcrypt --no-save
RUN npm install bcryptjs --save

EXPOSE 8001

CMD ["npm", "start"]