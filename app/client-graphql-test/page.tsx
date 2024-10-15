"use client";

import React, { useState, useEffect } from "react";
import { useContributorRolesQuery } from "@/generated/graphql";
import { handleApolloErrors } from "@/utils/gqlErrorHandler";
import { useRouter } from 'next/navigation';

export default function Page() {
    const [errors, setErrors] = useState<string[]>([]);
    const { data, loading, error, refetch } = useContributorRolesQuery();
    const router = useRouter();
    let roles;

    // UseEffect to handle async error handling
    useEffect(() => {
        if (error) {
            const handleErrors = async () => {
                await handleApolloErrors(
                    error.graphQLErrors,
                    error.networkError,
                    setErrors,
                    refetch,
                    router
                );
            };

            handleErrors();
        }
    }, [error, refetch]); // Runs when 'error' changes

    if (loading) {
        return <div>Loading...</div>;
    }

    if (data) {
        roles = data.contributorRoles;
    }

    return (
        <>
            <div>
                {errors && errors.map((err, index) => (
                    <p key={index}>{err}</p>
                ))}
            </div>
            <h1>Client-side GraphQL query test</h1>
            <ul>
                {roles &&
                    roles.map((role) => (
                        <li key={role?.id}>{role?.label}</li>
                    ))}
            </ul>
        </>
    );
}