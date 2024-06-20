import { setContext } from '@apollo/client/link/context';
import { getAuthTokenServer } from '@/utils/getAuthTokenServer';

const isServer = typeof window === 'undefined';

export const createAuthLink = () => {
    return setContext(async (_, { headers }) => {
        let token;

        if (typeof window === 'undefined') {
            //Server side
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