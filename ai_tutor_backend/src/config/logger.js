const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

const isProduction = process.env.NODE_ENV === 'production';
const LOG_LEVEL = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

const jsonFormat = format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
);

const consoleFormat = format.combine(
    format.colorize(),
    format.timestamp(),
    format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
        return `${timestamp} ${level}: ${message} ${metaStr}`;
    })
);

const transportList = [
    new transports.Console({
        level: LOG_LEVEL,
        format: isProduction ? jsonFormat : consoleFormat
    })

    // File logging temporarily disabled (permission issues in docker)
    // Uncomment when logs directory permissions are fixed:
    /*
    ,new transports.DailyRotateFile({
        filename: 'logs/app-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: false,
        maxSize: '20m',
        maxFiles: '14d',
        level: 'info',
        format: jsonFormat
    })
    */
];

const logger = createLogger({
    level: LOG_LEVEL,
    transports: transportList,
    exitOnError: false
});

module.exports = logger;
