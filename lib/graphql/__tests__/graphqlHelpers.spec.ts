import { errorLink, authLink, retryLink } from "@/lib/graphql/graphqlHelper";
import { refreshAuthTokens, fetchCsrfToken } from "@/utils/authHelper";

jest.mock('@/utils/navigation', () => ({
  navigateTo: jest.fn(),
}));

jest.mock("@/utils/clientLogger", () => ({
  __esModule: true,
  default: jest.fn()
}));

jest.mock("@/utils/authHelper", () => ({
  refreshAuthTokens: jest.fn(),
  fetchCsrfToken: jest.fn(),
}));

describe("GraphQL Helper Exports", () => {
  it("should export errorLink", () => {
    expect(errorLink).toBeDefined();
    expect(errorLink.constructor.name).toBe('ErrorLink');
  });

  it("should export authLink", () => {
    expect(authLink).toBeDefined();
    expect(authLink.constructor.name).toBe('SetContextLink');
  });

  it("should export retryLink", () => {
    expect(retryLink).toBeDefined();
    expect(retryLink.constructor.name).toBe('RetryLink');
  });
});

describe("Auth Helper Functions", () => {
  it("should have refreshAuthTokens function available", () => {
    expect(refreshAuthTokens).toBeDefined();
    expect(typeof refreshAuthTokens).toBe('function');
  });

  it("should have fetchCsrfToken function available", () => {
    expect(fetchCsrfToken).toBeDefined();
    expect(typeof fetchCsrfToken).toBe('function');
  });
});