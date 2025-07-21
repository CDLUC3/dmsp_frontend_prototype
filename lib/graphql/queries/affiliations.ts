import { gql } from '@apollo/client';

export const GET_AFFILIATIONS = gql`
query Affiliations($name: String!){
  affiliations(name: $name) {
    totalCount
    nextCursor
    items {
      id
      name
    }
  }
}`;
