import pino from 'pino';
import { ecsFormat } from '@elastic/ecs-pino-format';
import { fetchJWTAccessToken, JWTAccessToken } from "@/utils/server/serverAuthHelper";

const logLevel = process.env.LOG_LEVEL || 'info';

const logger = pino({ level: logLevel, ...ecsFormat() });

export interface LoggerContext {
  app: string;
  env: string;
  jti?: string;
  userId?: number;
}

async function buildLogContext(): Promise<LoggerContext> {
  const token: JWTAccessToken | undefined = await fetchJWTAccessToken();
  return {
    app: "nextJS",
    env: String(process.env.ENV ?? "development"),
    jti: token?.jti,
    userId: token?.id
  }
}

// Filter out undefined fields for cleaner logs
export async function prepareObjectForLogs(obj: object): Promise<object> {
  const cleansedObject = Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null)
  );
  const logContext = await buildLogContext();

  return {
    ...logContext,
    ...cleansedObject,
  }
}

export default logger;
