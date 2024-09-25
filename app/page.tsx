
import { getContributorRoles } from '@/lib/graphql/server/queries/collaborator';


//This is just a placeholder for the root page.
// This is just testing out the GraphQL request for this RSC component
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
}