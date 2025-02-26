const winston = require('winston');
const { format, transports } = winston;

// Create logs directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

// Define log format
const logFormat = format.printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  
  if (Object.keys(metadata).length > 0) {
    msg += JSON.stringify(metadata);
  }
  
  return msg;
});

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.metadata({ fillExcept: ['message', 'level', 'timestamp'] })
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        logFormat
      )
    }),
    new transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      format: logFormat
    }),
    new transports.File({ 
      filename: 'logs/combined.log',
      format: logFormat
    })
  ]
});

// Create a logger factory function
const createLogger = (context) => {
  return {
    debug: (message, meta = {}) => logger.debug(`[${context}] ${message}`, meta),
    info: (message, meta = {}) => logger.info(`[${context}] ${message}`, meta),
    warn: (message, meta = {}) => logger.warn(`[${context}] ${message}`, meta),
    error: (message, meta = {}) => logger.error(`[${context}] ${message}`, meta)
  };
};

module.exports = {
  createLogger
}; 