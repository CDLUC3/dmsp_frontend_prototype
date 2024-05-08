export interface ErrorMessages {
    'INTERNAL_SERVER_ERROR': string;
    'UNAUTHORIZED': string;
    'FORBIDDEN': string;
}
const userFriendlyErrorMessages: ErrorMessages = {
    'INTERNAL_SERVER_ERROR': 'There was an error on our server',
    'UNAUTHORIZED': 'You need to log in before you can access this information',
    'FORBIDDEN': 'You don\'t have permission to access this info'
}

export default userFriendlyErrorMessages;