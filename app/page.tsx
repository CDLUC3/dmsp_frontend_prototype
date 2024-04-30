
import { gql } from '@apollo/client';
import { getClient } from '@/lib/client';
import { getContributorRoles } from '@/lib/graphql/server/queries';

const GET_CONTRIBUTOR_ROLES = gql`
query ContributorRoles{
    contributorRoles {
        id
        label
        url
    }
}`;

//This is just testing out the GraphQL request for RSC pages
export default async function Home() {
  const roles = await getContributorRoles();


  return (
    <ul>
      {roles && roles.map(role => {
        return (
          <li key={role.id}>{role.label}</li>
        )
      })}
    </ul>
  )
  return (
    <h1>Home</h1>
  )
}
