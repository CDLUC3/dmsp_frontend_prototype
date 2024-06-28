import { setContext } from '@apollo/client/link/context';
import { getAuthTokenServer } from '@/utils/getAuthTokenServer';

const isServer = typeof window === 'undefined';

/**
 * Creates an authLink for the GraphQL Client instance.
 * The token value will be obtained differently based on whether it is for a
 * client-side or server-side component
 * @returns
 */
export const createAuthLink = () => {
    return setContext(async (_, { headers }) => {
        let token;

        try {
            //Server side
            if (typeof window === 'undefined') {
                token = await getAuthTokenServer();
            } else {
                //Client-side: fetch the token from an endpoint
                const response = await fetch('/api/get-tokens');
                if (!response.ok) {
                    throw new Error(`Failed to fetch tokens: ${response.statusText}`);
                }
                const data = await response.json();
                token = data.token;
            }
        } catch (err) {
            console.error('Error fetching tokens:', err);
            token = null;
        }

        return {
            headers: {
                ...headers,
                'CONTENT-TYPE': 'application/json', // CSRF prevention
                'Apollo-Require-Preflight': '', // This requires that the GraphQL server requires a 'preflight' from browser to prevent CSRF attack
                authorization: token ? `Bearer ${token}` : "",
            }
        }

    })
}