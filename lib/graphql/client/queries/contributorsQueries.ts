import { gql } from '@apollo/client';
import createApolloClient from '../apollo-client'

const client = createApolloClient();


const GET_CONTRIBUTOR_ROLES = gql`
query ContributorRoles{
    contributorRoles {
        id
        label
        url
    }
}`;


type RolesInterface = {
    id: string,
    label: string;
    url: string;
}
export async function getContributors(): Promise<RolesInterface[]> {
    try {
        const { data } = await client.query({
            query: GET_CONTRIBUTOR_ROLES,
            fetchPolicy: 'cache-first'
        })

        return data.contributorRoles;
    } catch (error: any) {
        console.log(`Something went wrong: ${error.message}`)
        throw new Error(`There was an error getting contributor roles: ${error.message}`)
    }
}
