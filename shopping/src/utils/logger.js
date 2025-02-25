const winston = require('winston');
const { LOG_LEVEL } = require('../config');

// Create logs directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

// Create a logger factory function
const createLogger = (module) => {
  return winston.createLogger({
    level: LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json()
    ),
    defaultMeta: { service: 'shopping-service', module },
    transports: [
      // Write all logs with level 'error' and below to error.log
      new winston.transports.File({ 
        filename: `logs/error.log`, 
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
      // Write all logs with level 'info' and below to combined.log
      new winston.transports.File({ 
        filename: `logs/combined.log`,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
      // Console output for development
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(
            info => `${info.timestamp} ${info.level}: [${info.module}] ${info.message}`
          )
        )
      })
    ]
  });
};

// Default logger
const logger = createLogger('app');

module.exports = logger;
module.exports.createLogger = createLogger; 