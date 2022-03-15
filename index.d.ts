declare class Logger {
    constructor(logType: string, options: any = {});
    getLogId(idLength: number): string;
    addLogEntry(level: string, message: string): void;
    addInfo(message: string): void;
    addError(message: string): void;
    clearLogs(): void;
    sendLogs(): void;
}