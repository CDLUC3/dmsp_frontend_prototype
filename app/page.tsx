// import Image from "next/image";
// import { getContributors } from '@/lib/graphql/queries';
// export default async function Home() {
//   const roles = await getContributors();
//   console.log(roles);
//   return (
//     <>
//       <h1>Roles</h1>
//       <ul>
//         {roles && roles.map(role => {
//           return (
//             <li key={role.id}>{role.label}</li>
//           )
//         })}
//       </ul>
//     </>
//   )
// }
import { gql } from '@apollo/client';
import { getClient } from '@/lib/client';
import { getContributorRoles } from '@/lib/graphql/server-query';

const GET_CONTRIBUTOR_ROLES = gql`
query ContributorRoles{
    contributorRoles {
        id
        label
        url
    }
}`;
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
