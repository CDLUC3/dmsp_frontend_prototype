import { ecsFormat } from '@elastic/ecs-pino-format';
import pino from 'pino';

const logger = pino(ecsFormat());

export default logger;