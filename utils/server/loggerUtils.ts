import { serverFetchAccessToken, JWTAccessToken } from "@/utils/server/serverAuthHelper";
import { REDACTION_KEYS, REDACTION_MESSAGE } from "@/utils/server/logger";

export interface LoggerContext {
  app: string;
  env: string;
  jti?: string;
  userId?: number;
}

export function maskEmail(email: string): string {
  const parts = email.split('@');
  if (parts.length !== 2) {
    // Not a valid email format
    return email;
  }

  const localPart = parts[0];
  const domainPart = parts[1];

  if (localPart.length <= 2) {
    // If the local part is too short, we can't mask it properly, so we just return the redaction message
    return REDACTION_MESSAGE;
  }

  const firstChar = localPart.charAt(0);
  const lastChar = localPart.charAt(localPart.length - 1);
  const maskedSection = '*'.repeat(localPart.length - 2);

  return `${firstChar}${maskedSection}${lastChar}@${domainPart}`;
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

// Inspect the keys and values of the object and recursively mask any sensitive information
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function redactSensitiveInfo(obj: any): any {

  console.log("REDACTING:", obj)

  if (Array.isArray(obj)) {
    return obj.map(redactSensitiveInfo);
  } else if (obj !== null && typeof obj === 'object') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const redactedObj: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (REDACTION_KEYS.includes(key)) {
        redactedObj[key] = REDACTION_MESSAGE;
      } else {
        redactedObj[key] = redactSensitiveInfo(value);
      }
    }
    return redactedObj;
  } else if (typeof obj === 'string') {
    // Replace any email addresses with the redaction message
    const emailRegex = /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    if (emailRegex.test(obj)) {
      // Mask each occurrence of an email address in the string using the maskEmail function
      return obj.replace(emailRegex, maskEmail);
    }
    return obj;
  }
  return obj;
}

// Filter out undefined fields for cleaner logs and attach JWT info
export async function prepareObjectForLogs(obj: object): Promise<object> {
  const logContext = await buildLogContext();
  const payload = { ...logContext, ...redactSensitiveInfo(obj) };

  // Remove any keys with undefined or null values
  return Object.fromEntries(
    Object.entries(payload).filter(([_, v]) => {
        return v !== undefined && v !== null
    })
  );
}
