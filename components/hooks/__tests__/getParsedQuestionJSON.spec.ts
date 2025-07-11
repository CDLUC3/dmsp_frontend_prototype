/* eslint-disable @typescript-eslint/consistent-type-assertions*/

import { getParsedQuestionJSON } from '../getParsedQuestionJSON';
import { Question } from '@/app/types';



// Mock logger
const logECS = jest.fn();
jest.mock('@/utils/clientLogger', () => ({
  __esModule: true,
  /*eslint-disable @typescript-eslint/no-explicit-any */
  default: (...args: any[]) => logECS(...args),
}));

const mockT = (key: string) => key;

describe('getParsedQuestionJSON', () => {
  beforeEach(() => {
    logECS.mockClear();
  });
  it('returns error if question is null', () => {
    const result = getParsedQuestionJSON(null, '/some/path', mockT);
    expect(result.parsed).toBeNull();
    expect(result.error).toBe('messaging.errors.invalidQuestionType');
  });

  it('returns error if question.json is missing', () => {
    const question = {} as Question;
    const result = getParsedQuestionJSON(question, '/some/path', mockT);
    expect(result.parsed).toBeNull();
    expect(result.error).toBe('messaging.errors.invalidQuestionType');
  });

  it('parses valid string JSON and returns parsed object', () => {
    const question = {
      json: JSON.stringify({ type: 'text', value: 'foo' })
    } as Question;
    const result = getParsedQuestionJSON(question, '/some/path', mockT);
    expect(result.parsed).toEqual({ type: 'text', value: 'foo' });
    expect(result.error).toBeUndefined();
  });

  it('returns error for invalid JSON string', () => {
    const question = {
      json: '{invalid json}'
    } as Question;
    const result = getParsedQuestionJSON(question, '/some/path', mockT);
    expect(result.parsed).toBeNull();
    expect(result.error).toBe('messaging.errors.questionJSONFParseFailed');
  });

  it('returns error for string JSON with invalid type', () => {
    const question = {
      json: JSON.stringify({ type: 'notAType', foo: 'bar' })
    } as Question;
    const result = getParsedQuestionJSON(question, '/some/path', mockT);
    expect(result.parsed).toBeNull();
    expect(result.error).toBe('messaging.errors.questionUnexpectedFormat');
  });

  it('returns parsed object for valid object JSON', () => {
    const parsed = {
      meta: {
        schemaVersion: "1.0"
      },
      type: "radioButtons",
      options: [
        {
          type: "option",
          attributes: {
            label: "Yes",
            value: "Yes",
            selected: true
          }
        },
        {
          type: "option",
          attributes: {
            label: "No",
            value: "No",
            selected: false
          }
        },
        {
          type: "option",
          attributes: {
            label: "Maybe",
            value: "Maybe",
            selected: false
          }
        }
      ]
    }
    const question = {
      json: "{\"meta\":{\"schemaVersion\":\"1.0\"},\"type\":\"radioButtons\",\"options\":[{\"type\":\"option\",\"attributes\":{\"label\":\"Yes\",\"value\":\"Yes\",\"selected\":true}},{\"type\":\"option\",\"attributes\":{\"label\":\"No\",\"value\":\"No\",\"selected\":false}},{\"type\":\"option\",\"attributes\":{\"label\":\"Maybe\",\"value\":\"Maybe\",\"selected\":false}}]}"
    } as Question;
    const result = getParsedQuestionJSON(question, '/some/path', mockT);
    expect(result.parsed).toEqual(parsed);
    expect(result.error).toBeUndefined();
  });

  it('returns error for object JSON with invalid type', () => {
    const question = {
      json: "{\"type\":\"notAType\",\"foo\":\"bar\"}"
    } as Question;
    const result = getParsedQuestionJSON(question, '/some/path', mockT);
    expect(result.parsed).toBeNull();
    expect(result.error).toBe('messaging.errors.questionUnexpectedFormat');
  });

  it('returns parsed object for valid object JSON (object branch)', () => {
    const parsed = {
      meta: {
        schemaVersion: "1.0"
      },
      type: "radioButtons",
      options: [
        {
          type: "option",
          attributes: {
            label: "Yes",
            value: "Yes",
            selected: true
          }
        },
        {
          type: "option",
          attributes: {
            label: "No",
            value: "No",
            selected: false
          }
        },
        {
          type: "option",
          attributes: {
            label: "Maybe",
            value: "Maybe",
            selected: false
          }
        }
      ]
    }
    const question = {
      json: "{\"meta\":{\"schemaVersion\":\"1.0\"},\"type\":\"radioButtons\",\"options\":[{\"type\":\"option\",\"attributes\":{\"label\":\"Yes\",\"value\":\"Yes\",\"selected\":true}},{\"type\":\"option\",\"attributes\":{\"label\":\"No\",\"value\":\"No\",\"selected\":false}},{\"type\":\"option\",\"attributes\":{\"label\":\"Maybe\",\"value\":\"Maybe\",\"selected\":false}}]}"

    } as Question;
    const result = getParsedQuestionJSON(question, '/some/path', mockT);
    expect(result.parsed).toEqual(parsed);
    expect(result.error).toBeUndefined();
    expect(logECS).not.toHaveBeenCalled();
  });

  it('returns error and logs for invalid object JSON (unexpected format branch)', () => {
    const question = {
      json: "{\"type\":\"notAType\",\"foo\":\"bar\"}"
    } as Question;
    const result = getParsedQuestionJSON(question, '/some/path', mockT);
    expect(result.parsed).toBeNull();
    expect(result.error).toBe('messaging.errors.questionUnexpectedFormat');
    expect(logECS).toHaveBeenCalledWith(
      'error',
      'getParsedQuestionJSON: Invalid question type',
      expect.objectContaining({ questionType: "notAType", url: { path: "/some/path" } })
    );
  });

  it('returns parsed object when question.json is already a valid object', () => {
    const question = {
      json: {
        type: 'text',
        value: 'already parsed'
      }
    } as unknown as Question;

    const result = getParsedQuestionJSON(question, '/some/path', mockT);

    expect(result.parsed).toEqual({
      type: 'text',
      value: 'already parsed'
    });
    expect(result.error).toBeUndefined();
  });

  it('returns error "error" and logs when question.json is an invalid object and not a valid question type', () => {
    const question = {
      json: {
        notAType: true,
        foo: 'bar'
      }
    } as unknown as Question;

    const result = getParsedQuestionJSON(question, '/some/path', mockT);

    expect(result.parsed).toBeNull();
    expect(result.error).toBe('error');

    expect(logECS).toHaveBeenCalledWith(
      'error',
      'getParsedQuestionJSON: Unexpected format',
      expect.objectContaining({
        error: expect.stringContaining('Invalid question format'),
        url: { path: '/some/path' }
      })
    );
  });
});