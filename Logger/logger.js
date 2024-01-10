const appRoot = require('app-root-path'); // root 경로를 가져오기 위해 사용
var winston = require('winston'); // log 파일 작성
require('winston-daily-rotate-file'); // log 파일을 일자별로 생성하기 위해 사용
const moment = require('moment');

var transport = new winston.transports.DailyRotateFile({
    filename: `${appRoot}/logs/application-%DATE%.log`,
    maxsize: 1024,
    datePatten: 'YYYY-MM-DD-HH',

    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf((info) => {
            return `[${moment().format('YYYY-MM-DD HH:mm:ss')}]${info.level}: ${info.message}`;
        })
    ),
});

var logger = winston.createLogger({
    transports: [transport],
});

module.exports = logger;
