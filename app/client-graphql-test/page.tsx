"use client";

import React, { useState, useEffect } from "react";
import { useContributorRolesQuery } from '@/generated/graphql';
import { handleError } from '@/utils/errorHandler';
import logECS from '@/utils/clientLogger';
import { useFlashMessage } from "@/context/FlashMessageContext";

export default function Page() {
    const [error, setError] = useState<string | null>(null);
    const { setFlashMessage } = useFlashMessage();
    const { data, loading, error: queryError } = useContributorRolesQuery();

    useEffect(() => {
        if (queryError) {
            logECS('error', queryError.message, {
                error: queryError
            });

            const customError = handleError(queryError, setFlashMessage);
            if (customError) {
                setError(customError);
            }
        }
    }, [queryError, setFlashMessage]);

    if (loading) {
        return <div>Loading...</div>
    }

    const roles = data?.contributorRoles;

    return (
        <>
            {error &&
                <div><p>{error}</p></div>
            }
            <h1>Clientside GraphQL query test</h1>
            <ul>
                {roles && roles.map(role => {
                    return (
                        <li key={role?.id}>{role?.label}</li>
                    )
                })}
            </ul>
        </>
    )
}