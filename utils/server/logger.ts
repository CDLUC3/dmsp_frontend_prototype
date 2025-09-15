import { ecsFormat } from '@elastic/ecs-pino-format';
import pino from 'pino';

// Fetch the log level from the environment variables, defaulting to 'info' if not set
const logLevel = process.env.SERVER_LOG_LEVEL || 'info';

// Create and export the logger instance with ECS format
const logger = pino({
  level: logLevel,
  redact: {
    paths: ['email', 'givenName', 'surName', 'password', 'pwd'],
    censor: '[MASKED]'
  },
  ...ecsFormat()
});
export default logger;