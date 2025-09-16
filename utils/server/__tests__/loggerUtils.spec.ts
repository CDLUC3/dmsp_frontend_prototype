// loggerHelper.test.ts
import { prepareObjectForLogs} from '../loggerUtils'; // adjust path
import { serverFetchAccessToken } from '@/utils/server/serverAuthHelper';
import { REDACTION_MESSAGE } from "@/utils/server/logger";

jest.mock('@/utils/server/serverAuthHelper', () => ({
  serverFetchAccessToken: jest.fn(),
}));

interface TestLog {
  app?: string;
  env?: string;
  jti?: string;
  userId?: number;
  someKey?: string;
  otherKey?: string;
  nullKey?: string | null;
  password?: string;
  email?: string;
  safe?: string;
}

describe('prepareObjectForLogs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should include token values when present', async () => {
    (serverFetchAccessToken as jest.Mock).mockResolvedValue({
      jti: 'token-jti',
      id: 42,
    });

    const result: TestLog = await prepareObjectForLogs({});

    expect(result.app).toEqual('nextJS');
    expect(result.env).toBeTruthy();
    expect(result.jti).toEqual('token-jti');
    expect(result.userId).toEqual(42);
  });

  it('should handle undefined token gracefully', async () => {
    (serverFetchAccessToken as jest.Mock).mockResolvedValue(undefined);

    const result: TestLog = await prepareObjectForLogs({});

    expect(result.app).toEqual('nextJS');
    expect(result.env).toBeTruthy();
    expect(result.jti).toBeFalsy();
    expect(result.userId).toBeFalsy();
  });

  it('should merge context and object, removing undefined/null', async () => {
    (serverFetchAccessToken as jest.Mock).mockResolvedValue({
      jti: 'abc',
      id: 99,
    });

    const obj = { someKey: 'value', otherKey: undefined, nullKey: null };
    const result: TestLog = await prepareObjectForLogs(obj);

    expect(result).toMatchObject({
      app: 'nextJS',
      env: expect.any(String),
      jti: 'abc',
      userId: 99,
      someKey: 'value',
    });

    // Ensure null/undefined dropped
    expect(result).not.toHaveProperty('otherKey');
    expect(result).not.toHaveProperty('nullKey');
  });

  it('should redact sensitive keys', async () => {
    (serverFetchAccessToken as jest.Mock).mockResolvedValue(undefined);

    const obj = { password: 'supersecret', safe: 'keepme', email: 'hide' };
    const result: TestLog = await prepareObjectForLogs(obj);

    expect(result.password).toBe(REDACTION_MESSAGE);
    expect(result.email).toBe(REDACTION_MESSAGE);
    expect(result.safe).toBe('keepme');
  });
});
