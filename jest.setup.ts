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
  // Enable the other parts of next-intl to not be mocked
  const originalModule = jest.requireActual('next-intl');

  return {
    ...originalModule,

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


// Make sure to catch extraneous errors that occur even when unit tests pass
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

let caughtConsoleErrors: string[] = [];

beforeEach(() => {
  jest.restoreAllMocks();
  caughtConsoleErrors = [];

  console.error = (...args) => {
    const message = args.join(' ');
    if (message.startsWith('Error:')) {
      caughtConsoleErrors.push(message);
    }
    originalConsoleError(...args); // Still log it for debugging
  };

  console.warn = originalConsoleWarn;

  process.on('unhandledRejection', (reason: unknown) => {
    if (reason instanceof Error && reason.message.startsWith('Error:')) {
      caughtConsoleErrors.push(`Unhandled rejection: ${reason.message}`);
    }
  });

  process.on('uncaughtException', (err: unknown) => {
    if (err instanceof Error && err.message.startsWith('Error:')) {
      caughtConsoleErrors.push(`Uncaught exception: ${err.message}`);
    }
  });
});

afterEach(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;

  process.removeAllListeners('unhandledRejection');
  process.removeAllListeners('uncaughtException');

  if (caughtConsoleErrors.length > 0) {
    const combined = caughtConsoleErrors.join('\n');
    throw new Error(
      `Test had unexpected console.error logs starting with "Error:":\n\n${combined}`
    );
  }
});