import pino from 'pino';
import { ecsFormat } from '@elastic/ecs-pino-format';
import { serverFetchAccessToken, JWTAccessToken } from "@/utils/server/serverAuthHelper";

const logLevel = process.env.LOG_LEVEL || 'info';

const logger = pino({ level: logLevel, ...ecsFormat() });

export interface LoggerContext {
  app: string;
  env: string;
  jti?: string;
  userId?: number;
}

// Attach important information from the JWT to the log so we can tie activity to
// activity in the Apollo server backend and other services
async function buildLogContext(): Promise<LoggerContext> {
  const token: JWTAccessToken | undefined = await serverFetchAccessToken();
  return {
    app: "nextJS",
    env: String(process.env.ENV ?? "development"),
    jti: token?.jti,
    userId: token?.id
  }
}

// Filter out undefined fields for cleaner logs and attach JWT info
export async function prepareObjectForLogs(obj: object): Promise<object> {
  const logContext = await buildLogContext();
  const payload = { ...logContext, ...obj };
  return Object.fromEntries(
    Object.entries(payload).filter(([_, v]) => v !== undefined && v !== null)
  );
}

export default logger;
