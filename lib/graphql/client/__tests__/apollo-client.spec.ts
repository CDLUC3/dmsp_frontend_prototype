import { ApolloLink, Observable } from "@apollo/client";
import { refreshAuthTokens } from "@/utils/authHelper";
import { GraphQLError } from "graphql";
import { errorLink } from "@/lib/graphql/client/apollo-client";
import logECS from "@/utils/clientLogger";
jest.mock("@/utils/authHelper", () => ({
  refreshAuthTokens: jest.fn(() => Promise.resolve({ response: true, message: 'ok' })),
  fetchCsrfToken: jest.fn(() => Promise.resolve({ response: true, message: 'ok' })),
}));

// Mock the entire module
jest.mock("@/utils/clientLogger", () => ({
  __esModule: true,  // If it's an ES module, ensure this is true
  default: jest.fn()  // Mock the default export as a Jest mock function
}));

describe("Apollo Client", () => {


  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.resetAllMocks();
  })

  it("should handle Network Errors", (done) => {
    const mockOperation = {
      setContext: jest.fn(),
      getContext: jest.fn(),
    }

    // Mock the forward link
    const mockForward = new ApolloLink(() =>
      new Observable((observer) => {
        observer.next({
          errors: [
            new GraphQLError('Unauthorized', {
              extensions: { code: 'UNAUTHORIZED' },
            }),
          ],
        });
        observer.complete();
      })
    );

    // Compose the error link with the mock forward link
    const link = ApolloLink.from([errorLink, mockForward]);

    // Execute the request
    /* eslint-disable @typescript-eslint/no-explicit-any */
    link.request(mockOperation as any)?.subscribe({
      next: (result) => {
        try {
          // Check if the error was caught and handled correctly
          expect(result.errors?.[0].message).toBe('Unauthorized');
          expect(logECS).toHaveBeenCalledWith(
            'error',
            expect.stringContaining('Unauthorized'),
            expect.objectContaining({ errorCode: 'UNAUTHORIZED' })
          );
          expect(refreshAuthTokens).toHaveBeenCalled();
          done(); // Signal that the test is done
        } catch (error) {
          console.log("***ERROR", error)
          done(error);
        }

      },
      error: (error) => {
        done(error) //Fail the test if there's an unexpected error
      }
    });

  });
});