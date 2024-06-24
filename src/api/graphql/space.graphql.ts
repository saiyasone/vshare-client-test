import { gql } from "@apollo/client";

export const QUERY_GET_SPACE = gql`
  query GetSpaces {
    getSpaces {
      name
      usedStorage
      totalStorage
    }
  }
`;
