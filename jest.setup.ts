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

const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  jest.restoreAllMocks(); // reset any mocks between tests

  console.error = (...args) => {
    throw new Error(`Unexpected console.error: ${args.join(' ')}`);
  };

  console.warn = (...args) => {
    throw new Error(`Unexpected console.warn: ${args.join(' ')}`);
  };

  // Fail test on uncaught promise rejections
  process.on('unhandledRejection', (reason) => {
    throw new Error(`Unhandled Promise rejection: ${reason}`);
  });

  // Fail test on unhandled exceptions
  process.on('uncaughtException', (err) => {
    throw err;
  });
});

afterEach(() => {
  // Restore original console behavior
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;

  process.removeAllListeners('unhandledRejection');
  process.removeAllListeners('uncaughtException');
});
