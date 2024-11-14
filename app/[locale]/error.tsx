'use client'//error boundary must be a client component

type ErrorProps = {
    error: Error;
    reset: () => void;
};


export default function ErrorBoundary({ error, reset }: ErrorProps) {

    return (
        <>
            <h2>{error.message || "Something went wrong!"} </h2>
            <button
                type="button"
                onClick={() => reset()}
            >
                Try Again
            </button>
        </>
    )
}
