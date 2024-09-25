import { setContext } from '@apollo/client/link/context';

/**
 * Creates an authLink for the GraphQL Client instance.
 * The token value will be obtained differently based on whether it is for a
 * client-side or server-side component
 * @returns
 */
export const createAuthLink = () => {
    return setContext(async (_, { headers }) => {

        return {
            headers: {
                ...headers,
                'CONTENT-TYPE': 'application/json', // CSRF prevention
            }
        }

    })
}