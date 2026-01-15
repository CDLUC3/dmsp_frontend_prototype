import logECS from "@/utils/clientLogger";

/**
 * Checks if an error is an AbortError (common in Apollo Client v4 with React Strict Mode)
 */
export const isAbortError = (error: unknown): boolean => {
  return (
    error instanceof Error &&
    (error.name === 'AbortError' || error.message.includes('AbortError'))
  );
};

/**
 * Handles Apollo query/mutation errors with automatic AbortError filtering
 * @param error - The error to handle
 * @param context - Context string for logging (e.g., component/function name)
 * @returns true if error was handled (logged), false if ignored (AbortError)
 */
export const handleApolloError = (
  error: unknown,
  context: string
): boolean => {
  // Ignore AbortErrors from React Strict Mode or navigation
  if (isAbortError(error)) {
    return false;
  }

  // Log the error
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  logECS('error', context, { error: errorMessage });

  return true;
};