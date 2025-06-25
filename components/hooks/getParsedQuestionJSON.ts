'use client'

//import { useTranslations } from 'next-intl';
import {
  Question,
} from '@/app/types';
import { QuestionTypeMap } from '@/utils/questionTypeHandlers';
import logECS from '@/utils/clientLogger';

type ParsedQuestionResult<T extends keyof QuestionTypeMap = keyof QuestionTypeMap> = {
  parsed: QuestionTypeMap[T] | null;
  error?: string;
};

// Type guard to check if parsed object has valid question type
const isValidQuestionType = (obj: any): obj is QuestionTypeMap[keyof QuestionTypeMap] => {
  return obj &&
    typeof obj === 'object' &&
    'type' in obj &&
    typeof obj.type === 'string' &&
    obj.type in ({
      text: true,
      textArea: true,
      radioButtons: true,
      checkBoxes: true,
      selectBox: true,
      boolean: true,
      url: true,
      currency: true,
      date: true,
      dateRange: true,
      email: true,
      filteredSearch: true,
      number: true,
      numberRange: true,
      table: true,
      typeaheadSearch: true
    } as const);
};


export const getParsedQuestionJSON = (
  question: Question | null,
  path: string
): ParsedQuestionResult => {
  // const Global = useTranslations('Global');

  if (!question?.json) {
    return { parsed: null, error: "error" };
  }

  const { json: source } = question;

  // Handle string JSON
  if (typeof source === 'string') {
    try {
      const parsed = JSON.parse(source);
      if (!isValidQuestionType(parsed)) {
        logECS('error', 'getParsedQuestionJSON: Invalid question type', {
          questionType: parsed?.type,
          url: { path }
        });
        return { parsed: null, error: "error" };
      }
      return { parsed };
    } catch (err) {
      logECS('error', 'getParsedQuestionJSON: JSON parse failed', {
        error: err,
        url: { path }
      });
      return { parsed: null, error: "error" };
    }
  }

  // Handle object JSON
  if (isValidQuestionType(source)) {
    return { parsed: source };
  }

  // Log unexpected format
  logECS('error', 'getParsedQuestionJSON: Unexpected format', {
    error: `Invalid question format. Expected valid question type, got: ${(source as any)?.type || typeof source}`,
    url: { path }
  });

  return { parsed: null, error: "error" };
};
