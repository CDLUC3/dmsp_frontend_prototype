import React, { forwardRef, useEffect, ReactNode } from "react";
import { scrollToTop } from '@/utils/general';

type ErrorMessagesProps = {
  errors: string[] | Record<string, string | null | undefined>;
};

// Shared Error Message rendering component for both arrays and objects
const ErrorMessages = forwardRef<HTMLDivElement, ErrorMessagesProps>(
  ({ errors }, ref) => {
    useEffect(() => {
      if (errors && Object.keys(errors).length > 0 && ref && "current" in ref && ref.current) {
        scrollToTop(ref);
      }
    }, [errors, ref]);


    // Filter out empty or invalid errors
    const hasValidErrors = (): boolean => {
      if (Array.isArray(errors)) {
        return errors.some((error) => error && error.trim() !== "");
      }

      return Object.values(errors).some((error) => error && error.trim() !== "");
    };

    if (!errors || !hasValidErrors()) return null;

    const renderErrors = (): ReactNode => {
      if (Array.isArray(errors)) {
        return errors
          .filter((error) => error && error.trim() !== "")
          .map((error, index) => <p key={index}>{error}</p>);
      }

      return Object.entries(errors)
        .filter(([_, error]) => error && error.trim() !== "")
        .map(([key, error]) => <p key={key}>{error}</p>);
    };

    return (
      <div className="messages error" role="alert" aria-live="assertive" ref={ref}>
        {renderErrors()}
      </div>
    );
  }
);

ErrorMessages.displayName = "ErrorMessages";

export default ErrorMessages;