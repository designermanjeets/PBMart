const winston = require('winston');
const { LOG_LEVEL } = require('../config');
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Define log format
const logFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    
    if (Object.keys(metadata).length > 0) {
        msg += JSON.stringify(metadata);
    }
    
    return msg;
});

// Create the logger
const logger = winston.createLogger({
    level: LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] })
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                logFormat
            )
        }),
        new winston.transports.File({ 
            filename: 'logs/error.log', 
            level: 'error',
            format: logFormat
        }),
        new winston.transports.File({ 
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