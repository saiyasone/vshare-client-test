import { gql } from "@apollo/client";

export const QUERY_GET_ANNOUNCEMENTS = gql`
  query Data(
    $where: AnnouncementWhereInput
    $orderBy: OrderByInput
    $skip: Int
    $limit: Int
  ) {
    getAnnouncements(
      where: $where
      orderBy: $orderBy
      skip: $skip
      limit: $limit
    ) {
      total
      data {
        _id
        createdAt
        createdBy {
          _id
          email
        }
        image
        status
        title
        updatedAt
        notificationTo
        startDate
        content
        endDate
        notificationStatus
      }
    }
  }
`;
