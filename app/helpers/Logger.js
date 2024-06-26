import fs from 'fs';
import path from 'path';

class Logger {
    constructor(filename) {
        const logsDirectory = path.join(process.cwd(), 'logs');

        if (!fs.existsSync(logsDirectory)) {
            fs.mkdirSync(logsDirectory);
        }

        this.logFilePath = path.join(logsDirectory, `${filename}.log`);
    }

    log(message) {
        const logMessage = `[${new Date().toISOString()}] ${message}\n`;

        fs.appendFileSync(this.logFilePath, logMessage, 'utf8');
    }
}

export default Logger;