FROM node:18-alpine

WORKDIR /app/search

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose the service port
EXPOSE 8009

# Start the service
CMD ["npm", "start"] 