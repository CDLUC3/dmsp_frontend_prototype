"use client";

import { useQuery, gql } from "@apollo/client"

const GET_CONTRIBUTOR_ROLES = gql`
query ContributorRoles{
    contributorRoles {
        id
        label
        url
    }
}`;

type ContributorRoles = {
    id: string;
    label: string;
}

/**
 * This is a test page to demo and test the use of graphql hooks on the client side.
 * Client-side graphql requests uses the apollo-wrapper.tsx file
 * @returns 
 */
export default function Page() {

    const { loading, error, data } = useQuery(GET_CONTRIBUTOR_ROLES);

    if (loading) {
        return <div>Loading...</div>
    }

    if (error) {
        console.error(error);
        return <div>Error</div>
    }

    const roles: ContributorRoles[] = data.contributorRoles;
    return (
        <>
            <h1>Clientside GraphQL query test</h1>
            <ul>
                {roles && roles.map(role => {
                    return (
                        <li key={role.id}>{role.label}</li>
                    )
                })}
            </ul>
        </>
    )
}

