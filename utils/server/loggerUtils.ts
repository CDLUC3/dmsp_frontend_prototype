import { serverFetchAccessToken, JWTAccessToken } from "@/utils/server/serverAuthHelper";
import { REDACTION_KEYS, REDACTION_MESSAGE } from "@/utils/server/logger";

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

  // Remove any keys with undefined or null values
  const cleansed = Object.fromEntries(
    Object.entries(payload).filter(([_, v]) => {
        return v !== undefined && v !== null
    })
  );

  // Redact the values of any keys that are sensitive
  for (const key of REDACTION_KEYS) {
    if (key in cleansed) {
      cleansed[key] = REDACTION_MESSAGE;
    }
  }
  return cleansed;
}
