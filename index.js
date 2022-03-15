const { createLogger, format, transports } = require('winston');
const moment = require('moment');
const loggerModel = require('./logs');
// adding logId, logType and loggedAt to logs
const myFormatter = format((info) => {
    const data = info.message;
    info.message = data.message;
    info.loggedAt = data.loggedAt;
    info.logId = data.logId;
    info.logType = data.logType;

    return info;
})();

class Logger {
    constructor(logType, options = {}) {
        this.logType = logType;
        this.logId = options.logId || this.getLogId();
        this.winstonLogger = null;
        this.logs = [];
        this.winstonLogger = createLogger({
            transports: [
                // file transport
                new transports.File({
                    filename: 'logs/server.log',
                    level: 'info',
                    format: format.combine(myFormatter, format.json()),
                    defaultMeta: { service: 'user-service' },
                }),
                // MongoDB transport
                // new transports.MongoDB({
                //     level: 'info',
                //     //mongo database connection link
                //     db: database,
                //     options: {
                //         useUnifiedTopology: true,
                //     },
                //     // A collection to save json formatted logs
                //     collection: 'cron_logs',
                //     format: format.combine(
                //         myFormatter,
                //         format.json(),
                //         format.metadata()
                //     ),
                // }),
            ],
        });
        this.logs = [];
    }

    // eslint-disable-next-line class-methods-use-this
    getLogId(idLength = 8) {
        let result = '';
        const characters =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < idLength; i += 1) {
            result += characters.charAt(
                Math.floor(Math.random() * charactersLength)
            );
        }
        return result;
    }

    addLogEntry(level, message) {
        if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.log({
                level,
                message: `${message} timestamp:${moment().toISOString()}`,
            });
        }
        this.logs.push({
            level,
            message: `${message} timestamp:${moment().toISOString()}`,
            loggedAt: moment().toISOString(),
        });
    }

    addInfo(message) {
        this.addLogEntry('info', message);
    }

    addError(message) {
        this.addLogEntry('error', message);
    }

    clearLogs() {
        this.logs = [];
    }

    sendLogs() {
        this.logs.map((log) =>
            this.winstonLogger.log({
                level: `${log.level}`,
                // message: `${this.logType} - ${this.logId} - ${log.message}`,
                message: {
                    logId: this.logId,
                    logType: this.logType,
                    ...log,
                },
            })
        );
        loggerModel.create(
            this.logs.map((log) => ({
                meta: {
                    logId: this.logId,
                    logType: this.logType,
                    loggedAt: log.loggedAt,
                },
                timestamp: log.loggedAt,
                ...log,
            }))
        );
    }
}

module.exports = { Logger };
