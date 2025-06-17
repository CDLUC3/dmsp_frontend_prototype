import '@testing-library/jest-dom';
import dotenv from 'dotenv';


//Load environment variables from .env.local
dotenv.config({ path: './.env.local' });//

// Mock toast
jest.mock('@/context/ToastContext', () => ({
  useToast: jest.fn(() => ({
    add: jest.fn(),
  })),
}));

jest.mock('next-intl', () => {
  return {
    useTranslations: jest.fn(() => {
      const mockUseTranslations = (key: string) => key;
      /*eslint-disable-next-line @typescript-eslint/no-explicit-any*/
      mockUseTranslations.rich = (key: string, values?: Record<string, any>) => {
        if (values?.p) {
          return values.p(key);
        }
        return key;
      };
      return mockUseTranslations;
    }),
  };
});

// Mock the clientLogger
jest.mock('@/utils/clientLogger', () => jest.fn());

// Mock the useParams and useRouter hooks
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn()
}))

