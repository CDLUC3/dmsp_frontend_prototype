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

    if (!errors || Object.keys(errors).length === 0) return null;

    const renderErrors = (): ReactNode => {
      if (Array.isArray(errors)) {
        return errors.map((error, index) => error && <p key={index}>{error}</p>);
      }

      return Object.entries(errors).map(([key, error]) =>
        error ? <p key={key}>{error}</p> : null
      );
    };

    return (
      <div className="messages error" role="alert" aria-live="assertive" ref={ref}>
        {renderErrors()}
      </div>
    );
  }
);

export default ErrorMessages;