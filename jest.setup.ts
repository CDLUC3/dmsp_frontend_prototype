import '@testing-library/jest-dom';
import {useTranslations as OriginalUseTranslations} from 'next-intl';
import dotenv from 'dotenv';


//Load environment variables from .env.local
dotenv.config({ path: './.env.local' });//

// Mock toast
jest.mock('@/context/ToastContext', () => ({
  useToast: jest.fn(() => ({
    add: jest.fn(),
  })),
}));

// Mock the useTranslations hook
type UseTranslationsType = ReturnType<typeof OriginalUseTranslations>;

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => {
    const mockUseTranslations: UseTranslationsType = ((key: string) => key) as UseTranslationsType;

    /*eslint-disable @typescript-eslint/no-explicit-any */
    mockUseTranslations.rich = (
      key: string,
      values?: Record<string, any>
    ) => {
      // Handle rich text formatting
      if (values?.p) {
        return values.p(key); // Simulate rendering the `p` tag function
      }
      return key;
    };

    return mockUseTranslations;
  }),
}));
