import {
  ApolloLink,
  FetchResult,
  NextLink,
  Observable,
  Operation
} from "@apollo/client";
import { redirect } from "next/navigation";
import { GraphQLError, Kind } from "graphql";
import { errorLink } from "@/lib/graphql/graphqlHelper";
import logECS from "@/utils/clientLogger";
import { refreshAuthTokens, fetchCsrfToken } from "@/utils/authHelper";


// Mock the entire module
jest.mock("@/utils/clientLogger", () => ({
  __esModule: true,  // If it's an ES module, ensure this is true
  default: jest.fn()  // Mock the default export as a Jest mock function
}));

jest.mock("@/utils/authHelper", () => ({
  refreshAuthTokens: jest.fn(),
  fetchCsrfToken: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn()
}))

describe("GraphQL Errors", () => {
  let operation: Operation;
  let forward: NextLink;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        href: '',
      },
      writable: true,
    });

    // Setup operation mock with proper typing
    operation = {
      setContext: jest.fn(),
      getContext: jest.fn(() => ({})),
      operationName: "TestQuery",
      extensions: {},
      variables: {},
      query: {
        kind: Kind.DOCUMENT,
        definitions: []
      }
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  })

  it("handles UNAUTHENTICATED error by refreshing token", async () => {
    // Setup forward mock with Unauthenticated error
    forward = jest.fn(() =>
      new Observable<FetchResult>((observer) => {
        observer.next({
          errors: [{
            message: "Unauthenticated",
            extensions: { code: "UNAUTHENTICATED" }
          }]
        });
        observer.complete();
        return () => { };
      })
    );
    (refreshAuthTokens as jest.Mock).mockResolvedValue(true);

    await new Promise<void>((resolve, reject) => {
      const subscription = (errorLink as NonNullable<typeof errorLink>)
        .request(operation, forward)!
        .subscribe({
          next: () => {
            try {
              expect(refreshAuthTokens).toHaveBeenCalledTimes(1);
              expect(forward).toHaveBeenCalledWith(operation);
              resolve();
            } catch (error) {
              reject(error);
            }
          },
          error: (error: Error) => {
            reject(error);
          },
          complete: () => {
            resolve();
          }
        });

      return () => subscription.unsubscribe();
    });
  });

  it("handles FORBIDDEN error by fetching a CSRF token", async () => {
    // Setup forward with Forbidden error
    forward = jest.fn(() =>
      new Observable<FetchResult>((observer) => {
        observer.next({
          errors: [{
            message: "Forbidden",
            extensions: { code: "FORBIDDEN" }
          }]
        });
        observer.complete();
        return () => { };
      })
    );
    (fetchCsrfToken as jest.Mock).mockResolvedValue(true);
    await new Promise<void>((resolve, reject) => {
      const subscription = (errorLink as NonNullable<typeof errorLink>)
        .request(operation, forward)!
        .subscribe({
          next: () => {
            try {
              expect(fetchCsrfToken).toHaveBeenCalledTimes(1);
              expect(forward).toHaveBeenCalledWith(operation);
              resolve();
            } catch (error) {
              reject(error);
            }
          },
          error: (error: Error) => {
            reject(error);
          },
          complete: () => {
            resolve();
          }
        });

      return () => subscription.unsubscribe();
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
          done(); // Mark the test as complete
        } catch (e) {
          done(e); // Fail the test if something goes wrong
        }
      },
    });
  });
})
