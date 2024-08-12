
import log, { LogLevelDesc } from 'loglevel';

interface ECSLog {
    '@timestamp': string;
    log: { level: string };
    message: string;
    event?: { kind?: string; category?: string };
    error?: { message?: string; stack?: string };
    url?: { path?: string };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any; //Allow additional properties
}

const ecsFormat = (level: string, message: string, details: object = {}): ECSLog => {
    return {
        '@timestamp': new Date().toISOString(),
        log: { level },
        message,
        ...details,
    };
};

log.setLevel('info');

export const logECS = (level: LogLevelDesc, message: string, details: object) => {
    const logEntry = ecsFormat(level as string, message, details);
    switch (level) {
        case 'debug':
            log.debug(logEntry);
            break;
        case 'info':
            log.info(logEntry);
            break;
        case 'warn':
            log.warn(logEntry);
            break;
        case 'error':
            log.error(logEntry);
            break;
        default:
            log.info(logEntry);
            break;
    }
}