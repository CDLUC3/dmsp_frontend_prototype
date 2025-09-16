import { ecsFormat } from '@elastic/ecs-pino-format';
import pino from 'pino';

// The fields that should be redacted from the logs
export const REDACTION_KEYS = [
  'email',
  'givenName',
  'surName',
  'password',
  'pwd',
  'token',
  'secret',
  'jwtSecret',
];

export const REDACTION_MESSAGE = '[MASKED]';

// Fetch the log level from the environment variables, defaulting to 'info' if not set
const logLevel = process.env.SERVER_LOG_LEVEL || 'info';

export function createLogger(dest?: pino.DestinationStream) {
  return pino({
    level: logLevel,
    redact: {
      paths: REDACTION_KEYS,
      censor: REDACTION_MESSAGE,
    },
    ...ecsFormat(),
  }, dest);
}

// default instance
const logger = createLogger();
export default logger;
