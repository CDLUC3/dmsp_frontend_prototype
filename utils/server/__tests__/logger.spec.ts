import { createLogger } from '../logger';
import { Writable } from 'stream';

interface TestResponse {
  "log.level": string;
  "@timestamp": string;
  "process.pid": number;
  "host.hostname": string;
  "ecs.version": string;
  userId: number;
  email: string;
  givenName: string;
  surName: string;
  password: string;
  pwd: string;
  accessLevel: string;
  nested: {
    email: string;
  };
  array: {
    email: string;
  }[];
  message: string;
}

describe('logger', () => {
  let output: TestResponse;

  it("redacts sensitive information", () => {
    // Send the logs to our test stream
    const dest = new Writable({
      write(chunk, _enc, cb) {
        output = JSON.parse(chunk.toString());
        cb();
      },
    });

    const logger = createLogger(dest);

    logger.info(
        {
          userId: 123,
          email: "tester@example.com",
          givenName: "Test",
          surName: "User",
          password: "abcdefg",
          pwd: "hijklmn",
          accessLevel: "tester",
        },
        "Testing redaction"
    );

    expect(output["log.level"]).toEqual("info");
    expect(output.userId).toEqual(123);
    expect(output.email).toEqual("[MASKED]");
    expect(output.givenName).toEqual("[MASKED]");
    expect(output.surName).toEqual("[MASKED]");
    expect(output.password).toEqual("[MASKED]");
    expect(output.pwd).toEqual("[MASKED]");
    expect(output.accessLevel).toEqual("tester");
    expect(output.message).toEqual("Testing redaction");
  });
});
