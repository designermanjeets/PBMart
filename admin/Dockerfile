FROM node:16

WORKDIR /app/admin

# Copy package files
COPY package*.json ./

# Clean install all dependencies
RUN rm -rf node_modules
RUN npm cache clean --force
RUN npm install
# Rebuild bcrypt for the current architecture
RUN npm rebuild bcrypt --build-from-source

# Copy application code
COPY . .

EXPOSE 8005

CMD ["npm", "start"] 