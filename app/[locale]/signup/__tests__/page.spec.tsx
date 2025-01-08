import React from 'react';
import {
  fireEvent,
  renderWithProviders,
  screen,
  waitFor,
} from '@/utils/test-utils'; //wrapping test with AuthProvider
import SignUpPage from '../page';
import logECS from '@/utils/clientLogger';

//Need to import this useRouter after the jest.mock is in place
import {useRouter} from 'next/navigation';
import {fetchCsrfToken, refreshAuthTokens} from "@/utils/authHelper";


jest.mock('next/navigation', () => ({
    useRouter: jest.fn()
}));


jest.mock('@/utils/clientLogger', () => ({
    __esModule: true,
    default: jest.fn()
}))


// Mock the entire CsrfContext module
jest.mock('@/context/CsrfContext', () => ({
    CsrfProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="mock-csrf-provider">{children}</div>
    ),
    useCsrf: jest.fn(),
}));

jest.mock('@/utils/authHelper', () => ({
    refreshAuthTokens: jest.fn(async () => Promise.resolve({ response: true, message: 'ok', headers: { 'content-type': 'application/json', 'x-csrf-token': 1234 } })),
    fetchCsrfToken: jest.fn(async () => Promise.resolve({ response: true, message: 'ok', headers: { 'content-type': 'application/json', 'x-csrf-token': 1234 } })),
}));


// Create a mock for scrollIntoView and focus
const mockScrollIntoView = jest.fn();
const mockFocus = jest.fn();

const mockUseRouter = useRouter as jest.Mock;

const mockFetchCsrfToken = fetchCsrfToken as jest.Mock;
const mockRefreshAuthTokens = refreshAuthTokens as jest.Mock;


global.fetch = global.fetch || require('node-fetch');


describe('SignUpPage', () => {
  const doSteps = async () => {
    // Step 1
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByText(/continue/i));

    await waitFor(() => {
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    });

    // Step 2
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText(/institution/i), {
      target: { value: "Other" },
    });
    fireEvent.change(screen.getByLabelText(/accept terms/i), {
      target: { checked: true },
    });
  }

  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    HTMLElement.prototype.focus = mockFocus;

    /*eslint-disable @typescript-eslint/no-var-requires */
    const { useCsrf } = require('@/context/CsrfContext');
    (useCsrf as jest.Mock).mockReturnValue({ csrfToken: 'mocked-csrf-token' });

    mockUseRouter.mockReturnValue({
      push: jest.fn(),
    })

    jest.spyOn(console, 'error').mockImplementation(() => { });
    jest.useFakeTimers();
  });

  afterEach(() => {
    HTMLElement.prototype.scrollIntoView = jest.fn();
    HTMLElement.prototype.focus = jest.fn();
    jest.restoreAllMocks();
    jest.clearAllMocks();
    jest.useRealTimers();
  })

  it("renders the email step initially", () => {
    renderWithProviders(<SignUpPage />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByText(/continue/i)).toBeInTheDocument();
  });

  it("transitions to the profile step on valid email submission", async () => {
    renderWithProviders(<SignUpPage />);

    const emailInput = screen.getByLabelText(/email address/i);
    const nextButton = screen.getByText(/continue/i);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/institution/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/accept terms/i)).toBeInTheDocument();
    });
  });

  it("submits the profile step successfully", async () => {
    jest.spyOn(global, 'fetch').mockImplementation((url) => {
      if (url === `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/apollo-signup`) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ message: 'mock message' })
        } as unknown as Response);
      }

      return Promise.reject(new Error('Unknown URL'));
    });

    renderWithProviders(<SignUpPage />);

    doSteps();
    await waitFor(() => {
      expect(screen.getByRole('form')).toBeInTheDocument();
    });
    const formEl = screen.getByRole('form');
    await fireEvent.submit(formEl);
    // fireEvent.click(screen.getByText(/sign up/i));

    // Filter out the fetch call with the apollo-signup URL
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    console.log(global.fetch.mock.calls);
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    const apolloSignupCall = (global.fetch as jest.Mock).mock.calls.find(call => {
      return typeof call[0] === 'string' && call[0].includes('/apollo-signup');
    });

    // const apolloSignupCall = (global.fetch as jest.Mock).mock.calls.find(call => call[0].includes('/apollo-signup'));

    expect(apolloSignupCall).toBeDefined(); // Check if apollo-signup was called
    expect(apolloSignupCall[0])
      .toBe(`${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/apollo-signup`);

    // Check that user is redirected to home page
    await waitFor(() => {
        expect(mockUseRouter().push).toHaveBeenCalledWith('/');
    })
  });

  it("displays server-side errors on profile submission", async () => {
    mockGraphQLRequest({
      query: "CREATE_USER",
      variables: { email: "test@example.com" },
      result: { errors: [{ message: "Server error" }] },
    });

    renderWithProviders(<SignUpPage />);

    doSteps();
    fireEvent.click(screen.getByText(/sign up/i));

    await waitFor(() => {
      expect(screen.getByText(/server error/i)).toBeInTheDocument();
    });
  });

  // it('should initially disable submit button after submitting form until response is returned ', async () => {
  //   jest.spyOn(global, 'fetch').mockImplementation((url) => {
  //     if (url === 'http://localhost:4000/apollo-signup') {
  //       return Promise.resolve({
  //         ok: true,
  //         status: 200,
  //       } as unknown as Response);
  //     }

  //     return Promise.reject(new Error('Unknown URL'));
  //   });

  //   renderWithProviders(<SignUpPage />);

  //   doSteps();

  //   const submitButton = screen.getByText(/sign up/i);
  //   fireEvent.click(submitButton);

  //   expect(submitButton).toBeDisabled();

  //   await waitFor(() => {
  //       expect(submitButton).not.toBeDisabled();
  //       expect(submitButton).toHaveTextContent('Sign up');
  //   });
  // });

  // it('should handle 401 error', async () => {
  //   jest.spyOn(global, 'fetch').mockImplementation((url) => {
  //     if (url === 'http://localhost:4000/apollo-signup') {
  //       return Promise.resolve({
  //         ok: false,
  //         status: 401,
  //         json: () => Promise.resolve({ message: 'Invalid credentials' })
  //       } as unknown as Response);
  //     }

  //     return Promise.reject(new Error('Unknown URL'));
  //   });
  //   renderWithProviders(<SignUpPage />);

  //   doSteps();
  //   fireEvent.click(screen.getByText(/sign up/i));

  //   // Check that user is redirected to 500 error page
  //   await waitFor(() => {
  //     expect(mockRefreshAuthTokens).toHaveBeenCalled();
  //   })

  //   // Check that user is redirected to home page
  //   await waitFor(() => {
  //     expect(mockUseRouter().push).toHaveBeenCalledWith('/');
  //   })
  // });

  // it('should handle 403 error by calling fetchCsrfToken', async () => {
  //   jest.spyOn(global, 'fetch').mockImplementation(() => {
  //     return Promise.resolve({
  //       ok: false,
  //       status: 403,
  //       json: () => Promise.resolve({ success: false, message: 'Invalid CSRF token' }),
  //     } as unknown as Response);
  //   });
  //   renderWithProviders(<SignUpPage />);

  //   doSteps();
  //   fireEvent.click(screen.getByText(/sign up/i));

  //   // Check that user is redirected to 500 error page
  //   await waitFor(() => {
  //     expect(mockFetchCsrfToken).toHaveBeenCalled();
  //   })
  // });

  // it('should handle 500 error', async () => {
  //   jest.spyOn(global, 'fetch').mockImplementation(() => {
  //       return Promise.resolve({
  //           ok: false,
  //           status: 500,
  //           json: () => Promise.resolve({ success: false, message: 'Internal Server Error' }),
  //       } as unknown as Response);
  //   });

  //   renderWithProviders(<SignUpPage />);

  //   doSteps();
  //   fireEvent.click(screen.getByText(/sign up/i));

  //   // Check that user is redirected to 500 error page
  //   await waitFor(() => {
  //     expect(mockUseRouter().push).toHaveBeenCalledWith('/500-error')
  //   })
  // });

  // it('should render correct errors to user for a 400 error', async () => {
  //   jest.spyOn(global, 'fetch').mockImplementation(() => {
  //     return Promise.resolve({
  //       ok: false,
  //       status: 400,
  //       json: () => Promise.resolve({ success: false, message: 'Invalid email address| Password is required' }),
  //     } as unknown as Response);
  //   });

  //   renderWithProviders(<SignUpPage />);

  //   doSteps();
  //   fireEvent.click(screen.getByText(/sign up/i));

  //   // //Check that error is rendered
  //   await waitFor(() => {
  //     const errorElement = screen.getByText(/Invalid email address/i);
  //     expect(errorElement).toBeInTheDocument();
  //   })
  // });

  // it('should render default error message when no response', async () => {
  //   jest.spyOn(global, 'fetch').mockImplementation(() => {
  //     return Promise.resolve(undefined as unknown as Response);
  //   });

  //   renderWithProviders(<SignUpPage />);

  //   doSteps();
  //   fireEvent.click(screen.getByText(/sign up/i));

  //   // //Check that error logged to the console
  //   await waitFor(() => {
  //     const errorDiv = screen.getByText('An unexpected error occurred. Please try again.').closest('div');
  //     expect(errorDiv).toHaveClass('error');
  //     expect(errorDiv).toContainHTML('<p>An unexpected error occurred. Please try again.</p>')
  //   });
  // });

  // it('should handle error returned from the fetch', async () => {
  //   jest.spyOn(global, 'fetch').mockImplementation(() => {
  //     return Promise.reject(new Error('Unknown URL'));
  //   });

  //   renderWithProviders(<SignUpPage />);

  //   doSteps();
  //   fireEvent.click(screen.getByText(/sign up/i));

  //   // Check that error logged
  //   await waitFor(() => {
  //     expect(logECS).toHaveBeenCalledWith(
  //       'error',
  //       'Signup error',
  //       expect.objectContaining({
  //         error: expect.anything(),
  //         url: { path: '/apollo-signup' },
  //       })
  //     )
  //   });
  // });
});
