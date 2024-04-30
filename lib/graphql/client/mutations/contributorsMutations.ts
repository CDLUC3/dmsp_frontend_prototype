import { gql } from '@apollo/client';
import createApolloClient from '../apollo-client';

const client = createApolloClient();

interface Contributor {
    url: string;
    label: string;
}

type ContributorData = {
    id: string;
    url: string;
    label: string;
    description?: string;
    created: Date;
}

const ADD_ROLE = gql`
mutation addContributorRole($url: URL!, $label: String!) {
    addContributorRole(url: $url, label: $label) {
        id
        label
        description
        url
        created
    }
}`;

const DELETE_CONTRIBUTOR = gql`
mutation RemoveContributorRole($removeContributorRoleId: String!) {
  removeContributorRole(id: $removeContributorRoleId)
}
`;

const UPDATE_CONTRIBUTOR = gql`
mutation Mutation($updateContributorRoleId: String!, $url: URL, $label: String) {
    updateContributorRole(id: $updateContributorRoleId, url: $url, label: $label) {
      id
      label
      url
    }
  }
`;

export async function addContributor(contributor: Contributor): Promise<ContributorData> {
    const { url, label } = contributor;
    try {
        const { data } = await client.mutate({
            mutation: ADD_ROLE,
            variables: { url: url, label: label },
        })

        return data.addContributorRole;
    } catch (error: any) {
        console.log(`Something went wrong: ${error.message}`)
        throw new Error(`There was an error when adding contributor: ${error.message}`)
    }
}

export async function deleteContributor(id: string) {
    try {
        const response = await client.mutate({
            mutation: DELETE_CONTRIBUTOR,
            variables: { removeContributorRoleId: id }
        })
        return response;
    } catch (err: any) {
        console.log(`Something went wrong when deleting a contributor`);
        throw new Error(`There was a problem when deleting a contributor: ${err.message}`)
    }
}

export async function updateContributor(id: string, url: string, label: string) {
    try {
        const response = await client.mutate({
            mutation: UPDATE_CONTRIBUTOR,
            variables: { updateContributorRoleId: id, url: url, label: label }
        })
        return response;
    } catch (err: any) {
        console.log(`Something went wrong while editing a contrivbutor`);
        throw new Error(`There was a problem when deleting a contrivbutor: ${err.message}`)
    }
}