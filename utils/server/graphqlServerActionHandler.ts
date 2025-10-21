"use server";

import { DocumentNode, print } from "graphql";
import { cookies } from "next/headers";
import logger from "@/utils/server/logger";
import { prepareObjectForLogs } from "@/utils/server/loggerUtils";
import { serverRefreshAuthTokens, serverFetchCsrfToken } from "@/utils/server/serverAuthHelper";

type GraphQLErrorCode = "UNAUTHENTICATED" | "FORBIDDEN" | "INTERNAL_SERVER_ERROR" | string;

interface GraphQLError {
  message: string;
  extensions?: {
    code?: GraphQLErrorCode;
  };
}

interface GraphQLActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  errors?: string[];
  redirect?: string;
}

/** Normalize various error formats into a consistent array */
function normalizeErrors(errors: unknown): string[] {
  if (!errors) return [];

  // If it's already a string array, return as is
  if (Array.isArray(errors)) {
    return errors
      .map(error => {
        if (typeof error === 'string') return error;
        if (error && typeof error === 'object' && 'message' in error) {
          return String(error.message);
        }
        return String(error);
      })
      .filter(Boolean);
  }

  // If it's an object with error properties, extract them
  if (typeof errors === 'object' && errors !== null) {
    const errorMessages: string[] = [];

    // Handle nested error objects (like from GraphQL responses)
    for (const value of Object.values(errors)) {
      if (Array.isArray(value)) {
        errorMessages.push(...value.map(String).filter(Boolean));
      } else if (value && typeof value === 'string') {
        errorMessages.push(value);
      } else if (value && typeof value === 'object' && 'message' in value) {
        errorMessages.push(String(value.message));
      } else if (value) {
        errorMessages.push(String(value));
      }
    }

    return errorMessages.length > 0 ? errorMessages : [];
  }

  // If it's a single string or other type, convert to array
  return [String(errors)].filter(Boolean);
}

/**
 * Execute a GraphQL mutation with comprehensive error handling
 *
 * @param document - The GraphQL mutation DocumentNodeto execute
 * @param variables - Variables to pass to the mutation
 * @param dataPath - Path to extract data from response (e.g., "addPlanMember")
 * @returns GraphQLActionResponse with appropriate success, data, errors, or redirect information
 */
export async function executeGraphQLMutation<T = unknown, V = Record<string, unknown>>({
  document,
  variables,
  dataPath
}: {
  document: DocumentNode | string;
  variables: V;
  dataPath: string;
}): Promise<GraphQLActionResponse<T>> {

  const mutationString = typeof document === "string" ? document : print(document);

  console.log("***VARIABLES IN GRAPHQL SERVER ACTION HANDLER: ", variables);
  console.log("***MUTATION STRING IN GRAPHQL SERVER ACTION HANDLER: ", mutationString);
  try {
    if (!mutationString) {
      throw new Error("No mutation string provided");
    }

    // Get all cookies
    const cookieStore = await cookies();
    const cookieString = cookieStore.toString();

    // Headers for the GraphQL request
    const headers = {
      "Content-Type": "application/json",
      Cookie: cookieString,
    };

    logger.debug(
      await prepareObjectForLogs({
        server: `${process.env.SERVER_ENDPOINT}/graphql`,
        headers,
        mutationString,
        variables
      }),
      "graphqlServerActionHandler sending mutation"
    );

    // Make the GraphQL request
    const response = await fetch(`${process.env.SERVER_ENDPOINT}/graphql`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({
        query: mutationString,
        variables,
      }),
    });

    const result = await response.json();

    // Handle GraphQL errors
    if (result.errors) {
      for (const { message, extensions } of result.errors) {
        const errorCode = extensions?.code;
        switch (errorCode) {
          case "UNAUTHENTICATED":
            try {
              // Get a new auth token if there is a refresh token
              const refreshResult = await serverRefreshAuthTokens();

              if (!refreshResult) {
                logger.error(
                  await prepareObjectForLogs({ error: new Error("UNAUTHENTICATED"), mutationString, variables }),
                  "Auth token refresh failed with no result"
                );
                return { success: false, redirect: "/login" };
              }

              // Extract and store cookies from response
              const nextCookies = await cookies();
              const setCookieHeader = refreshResult?.response?.headers?.get("set-cookie");

              if (!setCookieHeader) {
                logger.error(
                  await prepareObjectForLogs({ error: new Error("UNAUTHENTICATED"), mutationString, variables }),
                  "No set-cookie header found in refresh response"
                );
                return { success: false, redirect: "/login" };
              }

              const refreshedCookiesArray: string[] = [];
              setCookieHeader.split(",").forEach((cookieStr) => {
                const match = cookieStr.match(/^([^=]+)=([^;]+)/);
                if (match) {
                  const [, name, value] = match;
                  nextCookies.set(name.trim(), value.trim(), {
                    path: "/",
                    httpOnly: cookieStr.includes("HttpOnly"),
                    secure: cookieStr.includes("Secure"),
                  });
                  refreshedCookiesArray.push(`${name.trim()}=${value.trim()}`);
                }
              });

              // Get all existing cookies and combine them with the refreshed ones
              const existingCookies = nextCookies.toString();
              const combinedCookies = existingCookies
                ? `${existingCookies}; ${refreshedCookiesArray.join("; ")}`
                : refreshedCookiesArray.join("; ");

              // Set headers for GraphQL request with newly updated cookie
              const headers = {
                "Content-Type": "application/json",
                Cookie: combinedCookies,
              };

              // Retry GraphQL request after getting the new auth token
              const retryResponse = await fetch(`${process.env.SERVER_ENDPOINT}/graphql`, {
                method: "POST",
                headers,
                credentials: "include",
                body: JSON.stringify({ query: mutationString, variables }),
              });

              const retryResult = await retryResponse.json();

              if (retryResult.errors) {
                logger.error(
                  await prepareObjectForLogs({ error: new Error("GRAPHQL_ERROR"), mutationString, variables }),
                  `[GraphQL Retry Error]: ${retryResult.errors[0]?.message}`
                );
                return {
                  success: false,
                  errors: normalizeErrors(retryResult.errors.map((err: GraphQLError) => err.message))
                };
              }

              // Extract data using provided path
              const retryData = getNestedValue(retryResult.data, dataPath);

              return {
                success: true,
                data: retryData as T
              };
            } catch (error) {
              logger.error(
                await prepareObjectForLogs({ error, mutationString, variables }),
                "Token refresh failed"
              );
              return { success: false, redirect: "/login" };
            }

          case "FORBIDDEN":
            try {
              await serverFetchCsrfToken();
              return { success: false, errors: ["Forbidden. Please check your permissions."] };
            } catch (error) {
              logger.error(
                await prepareObjectForLogs({ error, mutationString, variables }),
                "Fetching CSRF token failed"
              );
              return { success: false, redirect: "/login" };
            }

          case "INTERNAL_SERVER_ERROR":
            logger.error(
              await prepareObjectForLogs({ error: new Error("INTERNAL_SERVER_ERROR"), mutationString, variables }),
              "Internal server error"
            );
            return { success: false, redirect: "/500-error" };

          default:
            logger.error(
              await prepareObjectForLogs({ error: new Error("GRAPHQL_ERROR"), mutationString, variables }),
              "GraphQL error"
            );
            return { success: false, errors: normalizeErrors(message) };
        }
      }
    }

    // Extract data using provided path
    const responseData = getNestedValue(result.data, dataPath);

    logger.debug(
      await prepareObjectForLogs({
        response: responseData
      }),
      "graphqlServerActionHandler received response"
    );

    return {
      success: true,
      data: responseData as T,
    };
  } catch (networkError) {
    logger.error(
      await prepareObjectForLogs({ error: networkError, mutationString, variables }),
      "GraphQL network error"
    );
    return { success: false, errors: ["There was a problem connecting to the server. Please try again."] };
  }
}

// Helper function to get a nested value from an object using a dot-notation path
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  if (!obj || !path) return undefined;

  const properties = path.split('.');
  let value: unknown = obj;

  for (const prop of properties) {
    if (value === null || value === undefined || typeof value !== 'object') {
      return undefined;
    }
    value = (value as Record<string, unknown>)[prop];

  }

  return value;
}
