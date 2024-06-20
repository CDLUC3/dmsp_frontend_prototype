"use client";

import { useQuery } from "@apollo/experimental-nextjs-app-support/ssr";

import { gql } from "@apollo/client";

const GET_CONTRIBUTOR_ROLES = gql`
query ContributorRoles{
    contributorRoles {
        id
        label
        url
    }
}`;

// This was placed here as an example of a client-side graphql request
export default function Page() {

    const { loading, error, data } = useQuery(GET_CONTRIBUTOR_ROLES);

    if (loading) {
        return <div>Loading...</div>
    }

    if (error) {
        console.error(error);
        return <div>Error</div>
    }

    const roles = data.contributorRoles;
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

