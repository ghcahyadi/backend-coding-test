const appRoot = require('app-root-path');

const winston = require('winston');

const options = {
  file: {
    level: 'info',
    filename: `${appRoot}/logs/app.log`,
    handleException: true,
    json: true,
    maxsize: 10000000,
    maxFiles: 10,
    colorize: false,
  },
  console: {
    level: 'debug',
    handleException: true,
    json: false,
    colorize: true,
  },
};

const logger = winston.createLogger({
  transports: [
    new winston.transports.File(options.file),
    new winston.transports.Console(options.Console),
  ],
  exitOnError: false,
});

logger.stream = {
  write(message) {
    logger.info(message);
  },
};

module.export = logger;