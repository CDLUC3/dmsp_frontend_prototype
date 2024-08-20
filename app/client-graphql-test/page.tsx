"use client";

import { useContributorRolesQuery } from '@/generated/graphql';

/**
 * This is a test page to demo and test the use of graphql hooks on the client side.
 * Client-side graphql requests uses the apollo-wrapper.tsx file
 * @returns 
 */
export default function Page() {
    let roles;
    const { data, loading, error } = useContributorRolesQuery();
    if (loading) {
        return <div>Loading...</div>
    }

    if (error) {
        console.error(error);
        return <div>Error</div>
    }

    if (data) {
        roles = data.contributorRoles;
    }

    return (
        <>
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

