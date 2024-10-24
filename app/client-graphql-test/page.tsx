"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useContributorRolesQuery } from "@/generated/graphql";
import { handleApolloErrors } from "@/utils/gqlErrorHandler";


export default function Page() {
    const [errors, setErrors] = useState<string[]>([]);
    const { data, loading, error, refetch } = useContributorRolesQuery();
    const router = useRouter();
    const t = useTranslations('clientQuery');
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
                <h1>{t('title')}</h1>
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