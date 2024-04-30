'use client';
import { gql } from '@apollo/client';
import React from 'react';
import { useQuery } from "@apollo/client";

const GET_CONTRIBUTOR_ROLES = gql`
query ContributorRoles{
    contributorRoles {
        id
        label
        url
    }
}`;
// This is to test using the ApolloWrapper for Apollo Client hooks
// I wanted to make sure the data was in sync with data returned from functions in lib/graphql/queries 
export default function WrapperTest() {
    const { loading, error, data } = useQuery(GET_CONTRIBUTOR_ROLES);
    let roles = [];
    if (data) {
        roles = data.contributorRoles;
    }

    return (
        <>
            <h1>Roles</h1>
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

