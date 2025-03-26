import { cookies } from "next/headers";
import logger from "@/utils/logger";

export class ServerAuthError extends Error {
  status: number | null;

  constructor({
    status,
    message,
    source,
  }: {
    status: number | null;
    message: string;
    source: string;
  }) {
    let statusMsg: string;
    if (status) {
      statusMsg = `[${status}] ${message}`;
    } else {
      statusMsg = `${message}`;
    }
    super(statusMsg);

    this.status = status;
    this.message = message;

    logger.error(`${statusMsg} - ${source}`);
  }
}

// Server-side refresh auth tokens
export const serverRefreshAuthTokens = async () => {
  try {
    // Get CSRF token first
    const csrfResponse = await serverFetchCsrfToken();
    if (!csrfResponse || !csrfResponse.ok) {
      return null;
    }

    const csrfToken = csrfResponse.headers.get("X-CSRF-TOKEN");
    if (!csrfToken) {
      throw new ServerAuthError({
        status: 403,
        message: "Forbidden. No CSRF token",
        source: "serverRefreshAuthTokens",
      });
    }

    // Get browser cookies
    const cookieStore = cookies();
    const cookieString = cookieStore.toString();

    // Refresh auth tokens
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/apollo-refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": csrfToken,
        Cookie: cookieString, // Attach all cookies
      },

    });

    if (!response.ok) {
      if (response.status === 401) {
        return { redirectTo: "/login" };
      }
      throw new ServerAuthError({
        status: response.status,
        message: "Error in response from refreshing auth tokens",
        source: "serverRefreshAuthTokens",
      });
    }

    // Extract the Set-Cookie headers from the response
    const setCookieHeaders = response.headers.get('Set-Cookie');


    const message = await response.json();
    return {
      response,
      message,
      cookies: setCookieHeaders
    };
  } catch (err) {
    logger.error("Error refreshing auth token", err);
    return null;
  }
};

// Server-side fetch CSRF token
export const serverFetchCsrfToken = async () => {
  try {
    const cookieStore = cookies();
    const cookieString = cookieStore.toString();

    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/apollo-csrf`, {
      headers: {
        Cookie: cookieString, // Attach all cookies
      },

    });

    return response;
  } catch (err) {
    logger.error("Error getting CSRF token", err);
    return null;
  }
};