const winston = require('winston');
const { LOG_LEVEL } = require('../config');

const createLogger = (module) => {
    return winston.createLogger({
        level: LOG_LEVEL,
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
            winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] })
        ),
        defaultMeta: { service: 'rfq-service', module },
        transports: [
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.printf(({ level, message, timestamp, metadata }) => {
                        return `${timestamp} [${level}]: [${module}] ${message}${Object.keys(metadata).length ? JSON.stringify(metadata) : ''}`;
                    })
                )
            })
        ]
    });
};

module.exports = { createLogger }; 