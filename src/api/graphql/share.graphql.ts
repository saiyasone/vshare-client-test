import { gql } from "@apollo/client";

export const QUERY_SHARE = gql`
  query GetShare(
    $where: ShareWhereInput
    $orderBy: OrderByInput
    $skip: Int
    $limit: Int
  ) {
    getShare(where: $where, orderBy: $orderBy, skip: $skip, limit: $limit) {
      data {
        _id
        isShare

        ownerId {
          _id
          email
          newName
        }
        fileId {
          _id
          filename
          isPublic
          favorite
          size
          url
          fileType
          totalDownload
          newFilename
          path
          newPath
          updatedAt
          createdAt
          filePassword
          status
        }
        folderId {
          folder_name
          _id
          folder_type
          file_id {
            _id
            filename
            size
          }
          newFolder_name
          total_size
          is_public
          checkFolder
          status
          path
          newPath
          url
          pin
          access_password
          updatedAt
        }
        createdAt
        fromAccount {
          _id
          username
          email
          newName
        }
        toAccount {
          _id
          email
          username
        }
        accessKey
        isPublic
        status
        permission
        accessedAt
        expiredAt
      }
      total
    }
  }
`;

export const MUTATION_CREATE_SHARE = gql`
  mutation CreateShare($body: ShareInput) {
    createShare(body: $body) {
      _id
    }
  }
`;

export const MUTATION_DELETE_SHARE = gql`
  mutation RemoveShare($id: ID!) {
    removeShare(ID: $id)
  }
`;

export const MUTATION_UPDATE_SHARE = gql`
  mutation UpdateShare($id: ID!, $body: UpdateShareInput) {
    updateShare(ID: $id, body: $body)
  }
`;

export const MUTATION_CREATE_SHARE_FROM_SHARING = gql`
  mutation HandleOnlyShare($body: OnlyShareInput) {
    handleOnlyShare(body: $body) {
      _id
    }
  }
`;
