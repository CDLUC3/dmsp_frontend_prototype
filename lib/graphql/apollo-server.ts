import { registerApolloClient } from "@apollo/experimental-nextjs-app-support/rsc";
import { ApolloLink, createHttpLink } from "@apollo/client";
import { InMemoryCache, ApolloClient } from "@apollo/client";
import { setContext } from '@apollo/client/link/context';
import { cookies } from 'next/headers';

// Create a server auth link that forwards cookies
const createServerAuthLink = () => {
  return setContext(async (_, { headers }) => {
    // Get cookies from the incoming request
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();

    // Convert cookies to header format
    const cookieHeader = allCookies
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('; ');

    return {
      headers: {
        ...headers,
        'Cookie': cookieHeader, // Forward all cookies
        'Content-Type': 'application/json',
      }
    };
  });
};

export const { getClient } = registerApolloClient(() => {
  const httpLink = createHttpLink({
    uri: `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/graphql`,
    credentials: 'include',
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.from([
      createServerAuthLink(),
      httpLink,
    ]),
  });
});