import { gql } from "@apollo/client";

export const QUERY_LOG = gql`
  query GetLogs($where: LogParamsInput, $limit: Int, $orderBy: OrderByInput) {
    getLogs(where: $where, limit: $limit, orderBy: $orderBy) {
      total
      data {
        _id
        name
        status
        description
        createdAt
        refreshID
      }
    }
  }
`;
