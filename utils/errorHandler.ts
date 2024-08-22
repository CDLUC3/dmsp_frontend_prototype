import { ApolloError } from '@apollo/client';
import { useRouter } from 'next/navigation';
import logECS from '@/utils/clientLogger';

export const handleError = (error: any, setFlashMessage: (message: { type: 'success' | 'error' | 'info', message: string }) => void) => {
    let message = 'An unexpected error occurred';
    const router = useRouter();
    // Handle Apollo Client GraphQL errors
    if (error instanceof ApolloError) {
        if (error.graphQLErrors.length > 0) {
            error.graphQLErrors.forEach(graphQLError => {
                switch (graphQLError.extensions?.code) {
                    case 'UNAUTHORIZED':
                        setFlashMessage({ type: 'error', message: 'You are not authenticated. Please log  in.' })
                        logECS('error', `[GraphQL Error]: UNAUTHORIZED - ${graphQLError.message}`, {
                            error: graphQLError
                        });
                        router.push('/login');
                        break;
                    case 'FORBIDDEN':
                        setFlashMessage({ type: 'error', message: 'You do not have permission to access this resource.' })
                        logECS('error', `[GraphQL Error]: FORBIDDEN - ${graphQLError.message}`, {
                            error: graphQLError
                        });
                        router.push('/login');
                        break;
                    case 'BAD_USER_INPUT':
                        message = 'There was a problem with your input.'
                        break;
                    default:
                        message = graphQLError.message;
                }
            });
        } else if (error.networkError) {
            message = 'Network error occurred.'
        }
    } else if (error.response) {
        // Handle HTTP status codes
        switch (error.response.status) {
            case 404:
                setFlashMessage({ type: 'error', message: 'Something went wrong.' })
                logECS('error', `404 Error - ${error.message}`, {
                    error: error
                });
                router.push('/404-error');
                break;
            case 500:
                setFlashMessage({ type: 'error', message: 'Something went wrong.' })
                logECS('error', `500 Error - ${error.message}`, {
                    error: error
                });
                router.push('/500-error');
                break;
            default:
                message = `Error: ${error.response.statusText}`;
                logECS('error', message, {
                    error: error
                });
        }
    } else if (error.message) {
        // Handle other types of errors (e.g., client-side errors)
        setFlashMessage({ type: 'error', message: 'Something went wrong.' })
        router.push('/500-error');
        return;
        //message = error.message;
    }

    return message;

}
