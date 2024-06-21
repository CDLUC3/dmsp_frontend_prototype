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

        //Server side
        if (typeof window === 'undefined') {
            token = await getAuthTokenServer();
        } else {
            //Client-side: fetch the token from an endpoint
            const response = await fetch('/api/get-token');
            const data = await response.json();
            token = data.token;
        }

        return {
            headers: {
                ...headers,
                authorization: token ? `Bearer ${token}` : "",
            }
        }
    })
}