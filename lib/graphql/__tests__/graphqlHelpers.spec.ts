import { ApolloLink, Observable } from "@apollo/client";
import { redirect } from "next/navigation";
import { GraphQLError } from "graphql";
import { errorLink } from "@/lib/graphql/graphqlHelper";
import logECS from "@/utils/clientLogger";

// Mock the entire module
jest.mock("@/utils/clientLogger", () => ({
  __esModule: true,  // If it's an ES module, ensure this is true
  default: jest.fn()  // Mock the default export as a Jest mock function
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn()
}))

describe("GraphQL Errors", () => {
  beforeAll(() => {
    process.on('unhandledRejection', (reason) => {
      throw reason;  // Ensure unhandled rejections fail the tests
    });
  });
  beforeEach(() => {

    jest.clearAllMocks();
    jest.resetAllMocks();

  });
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  })

  it("should handle Unauthorized GraphQL errors", (done) => {
    const mockOperation = {
      setContext: jest.fn(),
      getContext: jest.fn(),
    }

    // Mock the forward link
    const mockForward = new ApolloLink(() =>
      new Observable((observer) => {
        observer.next({
          errors: [
            new GraphQLError('Unauthenticated', {
              extensions: { code: 'UNAUTHENTICATED' },
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
          expect(result.errors?.[0].message).toBe('Unauthenticated');
          expect(logECS).toHaveBeenCalledWith(
            'error',
            expect.stringContaining('Unauthenticated'),
            expect.objectContaining({ errorCode: 'UNAUTHENTICATED' })
          );
          done(); // Signal that the test is done
        } catch (error) {
          done(error);
        }

      },
      error: (error) => {
        done(error) //Fail the test if there's an unexpected error
      }
    });

  });

  it("should handle Forbidden GraphQL errors", (done) => {
    const mockOperation = {
      setContext: jest.fn(),
      getContext: jest.fn(),
    }

    // Mock the forward link
    const mockForward = new ApolloLink(() =>
      new Observable((observer) => {
        observer.next({
          errors: [
            new GraphQLError('Forbidden', {
              extensions: { code: 'FORBIDDEN' },
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
          expect(result.errors?.[0].message).toBe('Forbidden');
          expect(logECS).toHaveBeenCalledWith(
            'error',
            expect.stringContaining('Forbidden'),
            expect.objectContaining({ errorCode: 'FORBIDDEN' })
          );
          done(); // Signal that the test is done
        } catch (error) {
          done(error);
        }

      },
      error: (error) => {
        done(error) //Fail the test if there's an unexpected error
      }
    });

  });

  it("should handle INTERNAL SERVER ERROR", async () => {
    const mockOperation = {
      setContext: jest.fn(),
      getContext: jest.fn(),
    }

    // Mock the forward link
    const mockForward = new ApolloLink(() =>
      new Observable((observer) => {
        observer.next({
          errors: [
            new GraphQLError('Internal Server Error', {
              extensions: { code: 'INTERNAL_SERVER_ERROR' },
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
        // Check if the error was caught and handled correctly
        expect(result.errors?.[0].message).toBe('Internal Server Error');
        expect(logECS).toHaveBeenCalledWith(
          'error',
          expect.stringContaining('Internal Server Error'),
          expect.objectContaining({ errorCode: 'INTERNAL_SERVER_ERROR' })
        );
        expect(redirect).toHaveBeenCalledWith("/500-error");
      },
    });
  });

  it("should handle general GraphQL error", async () => {
    const mockOperation = {
      setContext: jest.fn(),
      getContext: jest.fn(),
    }

    // Mock the forward link
    const mockForward = new ApolloLink(() =>
      new Observable((observer) => {
        observer.next({
          errors: [
            new GraphQLError('GraphQL Error', {
              extensions: { code: 'GRAPHQL_ERROR' },
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
        // Check if the error was caught and handled correctly
        expect(result.errors?.[0].message).toBe('GraphQL Error');
        expect(logECS).toHaveBeenCalledWith(
          'error',
          expect.stringContaining('GraphQL Error'),
          expect.objectContaining({ errorCode: 'GRAPHQL_ERROR' })
        );
      },
    });
  });
});

describe("Network Errors", () => {
  beforeEach(() => {

    jest.clearAllMocks();
    jest.resetAllMocks();

  });
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  })

  it("should handle network errors", (done) => {
    const mockOperation = {
      setContext: jest.fn(),
      getContext: jest.fn(),
    };

    // Mock the forward link to simulate a network error
    const mockForward = new ApolloLink(() =>
      new Observable((observer) => {
        observer.error(new Error("Network Error")); // Simulate a network error
      })
    );

    // Compose the error link with the mock forward link
    const link = ApolloLink.from([errorLink, mockForward]);

    // Execute the request
    link.request(mockOperation as any)?.subscribe({
      next: () => {
        done(new Error("Expected a network error, but got a successful response"));
      },
      error: (error) => {
        try {
          // Check that the network error was logged correctly
          expect(error.message).toBe("Network Error");
          expect(logECS).toHaveBeenCalledWith(
            "error",
            expect.stringContaining("Network Error"),
            expect.objectContaining({ errorCode: "NETWORK_ERROR" })
          );

          // Ensure the network error context was set
          expect(mockOperation.setContext).toHaveBeenCalledWith(
            expect.objectContaining({
              networkError: expect.objectContaining({
                message: "Network Error",
                customInfo: { errorMessage: "There was a problem " },
              }),
            })
          );
          done(); // Mark the test as complete
        } catch (e) {
          done(e); // Fail the test if something goes wrong
        }
      },
    });
  });
})