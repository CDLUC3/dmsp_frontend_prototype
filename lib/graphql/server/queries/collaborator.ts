import { gql } from '@apollo/client';
import { getClient } from '@/lib/graphql/client';

const GET_MEMBER_ROLES = gql`
query MemberRoles{
    MemberRoles {
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

export async function getMemberRoles(): Promise<RolesInterface[]> {
    try {
        const { data } = await getClient().query({
            query: GET_MEMBER_ROLES,
            context: {
                fetchOptions: {
                    next: { revalidate: 5 },
                }
            }
        });

        return data.memberRoles;
    } catch (error: unknown) {
        console.log(`Something went wrong: ${error}`)
        throw new Error(`There was an error getting member roles: ${error}`)
    }
}
