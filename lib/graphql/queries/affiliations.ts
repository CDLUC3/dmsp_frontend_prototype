import { gql } from '@apollo/client';

export const GET_AFFILIATIONS = gql`
query Affiliations($term: String!){
  affiliations(term: $term) {
    id
    name
  }
}`;
