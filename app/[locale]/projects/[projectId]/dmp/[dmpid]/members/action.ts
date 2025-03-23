"use server";

import { AddPlanContributorDocument } from "@/generated/graphql";
import { cookies } from "next/headers";
import logger from "@/utils/logger";
import { serverRefreshAuthTokens, serverFetchCsrfToken } from "@/utils/serverAuthHelper";

type GraphQLErrorCode = "UNAUTHENTICATED" | "FORBIDDEN" | "INTERNAL_SERVER_ERROR" | string;

interface GraphQLError {
  message: string;
  extensions?: {
    code?: GraphQLErrorCode;
  };
}

export async function addPlanContributorAction({
  planId,
  projectContributorId,
}: {
  planId: number;
  projectContributorId: number;
}) {
  try {
    // Extract mutation string from the generated document
    const mutationString = AddPlanContributorDocument.loc?.source.body;

    if (!mutationString) {
      throw new Error("Could not extract mutation string from document");
    }

    // Get all cookies
    const cookieStore = cookies();
    const cookieString = cookieStore.toString(); // Convert cookies to a string format for the request

    // Headers for the GraphQL request
    const headers = {
      "Content-Type": "application/json",
      Cookie: cookieString, // Attach all cookies
    };

    // Make the GraphQL request
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/graphql`, {
      method: "POST",
      headers,
      credentials: "include", // Ensure cookies are sent with the request
      body: JSON.stringify({
        query: mutationString,
        variables: {
          planId,
          projectContributorId
        },
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
                logger.error("Auth token refresh failed with no result", { error: "UNAUTHENTICATED" });
                return { redirect: "/login" };
              }

              // Extract and store cookies from response
              const nextCookies = cookies();
              const setCookieHeader = refreshResult?.response?.headers?.get("set-cookie");

              if (!setCookieHeader) {
                logger.error("No set-cookie header found in refresh response", { error: "UNAUTHENTICATED" });
                return { redirect: "/login" };
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

              // Set headers for GraphQL request with newly updated dmpst cookie
              const headers = {
                "Content-Type": "application/json",
                Cookie: combinedCookies,
              };

              // Retry GraphQL request after getting the new auth token 'dmspt'
              const retryResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/graphql`, {
                method: "POST",
                headers,
                credentials: "include",
                body: JSON.stringify({ query: mutationString, variables: { planId, projectContributorId } }),
              });

              const retryResult = await retryResponse.json();

              if (retryResult.errors) {
                logger.error(`[GraphQL Retry Error]: ${retryResult.errors[0]?.message}`, { error: "GRAPHQL_ERROR" });
                return { errors: retryResult.errors.map((err: GraphQLError) => err.message) };
              }

              return { success: true, data: retryResult.data?.addPlanContributor };

            } catch (error) {
              logger.error("Token refresh failed", { error });
              return { redirect: "/login" };
            }
            break;

          case "FORBIDDEN":
            try {
              await serverFetchCsrfToken();
            } catch (error) {
              logger.error("Fetching CSRF token failed", { error });
              return { redirect: "/login" };
            }
            break;

          case "INTERNAL_SERVER_ERROR":
            logger.error(`[GraphQL Error]: INTERNAL_SERVER_ERROR - ${message}`, { error: "INTERNAL_SERVER_ERROR" });
            return { redirect: "/500-error" };
            break;

          default:
            logger.error(`[GraphQL Error]: ${message}`, { error: "GRAPHQL_ERROR" });
            return { errors: [message] };
        }
      }
    }

    return {
      success: true,
      data: result.data?.addPlanContributor,
    };
  } catch (networkError) {
    logger.error(`[GraphQL Network Error]: ${networkError}`, { error: "NETWORK_ERROR" });
    return { errors: ["There was a problem connecting to the server. Please try again."] };
  }
}