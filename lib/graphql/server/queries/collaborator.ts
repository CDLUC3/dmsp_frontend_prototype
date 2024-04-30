import { gql } from '@apollo/client';
import { getClient } from '@/lib/client';

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

export async function getContributorRoles(): Promise<RolesInterface[]> {
    try {
        const { data } = await getClient().query({
            query: GET_CONTRIBUTOR_ROLES,
            context: {
                fetchOptions: {
                    next: { revalidate: 5 },
                }
            }
        });

        return data.contributorRoles;
    } catch (error: any) {
        console.log(`Something went wrong: ${error.message}`)
        throw new Error(`There was an error getting contributor roles: ${error.message}`)
    }
}