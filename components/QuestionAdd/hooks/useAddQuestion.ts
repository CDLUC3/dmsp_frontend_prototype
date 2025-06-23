import { OPTIONS_QUESTION_TYPES } from '@/lib/constants';
import {
  Question,
} from '@/app/types';
import logECS from '@/utils/clientLogger';
import { routePath } from '@/utils/routes';

// Configure what overrides you want to apply to the question type json objects
export const getOverrides = (questionType: string | null | undefined) => {
  switch (questionType) {
    case "text":
      return { maxLength: null };
    case "textArea":
      return { maxLength: null, rows: 20 };
    case "number":
      return { min: 0, max: 10000000, step: 1 };
    case "currency":
      return { min: 0, max: 10000000, step: 0.01 };
    case "url":
      return { maxLength: 2048, minLength: 2, pattern: "https?://.+" };
    default:
      return {};
  }
};

// Check if question is an options type
export const isOptionsType = (questionType: string) => {
  return Boolean(questionType && OPTIONS_QUESTION_TYPES.includes(questionType));
}

// Get parsed question
export const getParsedQuestionJSON = (question: Question | null): any | null => {
  if (!question || !question.json) return null;

  const source = question.json;

  if (typeof source === 'string') {
    try {
      return JSON.parse(source);
    } catch (err) {
      logECS('error', 'getParsedQuestionJSON error', {
        error: err,
        url: { path: routePath('template.q.slug') }
      });
      return null;
    }
  }

  // If already an object, do a light structure check
  if (typeof source === 'object' && source !== null && 'type' in source) {
    return source;
  }

  logECS('error', 'getParsedQuestionJSON error', {
    error: `Unexpected format for question.json: ${source}`,
    url: { path: routePath('template.q.slug') }
  });
  return null;
};