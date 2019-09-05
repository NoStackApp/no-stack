import gql from 'graphql-tag';

export const TYPES_NOT_IN_TREE_QUERY = gql`
  query TYPES_NOT_IN_TREE($treeId: ID!, $platformId: ID!) {
    typesNotInTree(treeId: $treeId, platformId: $platformId) {
      id
      name
    }
  }
`;

export const TYPE_ASSNS_QUERY = gql`
  query TYPE_ASSNS($id: ID!) {
    Type(id: $id) {
      id
      assns {
        id
        name
        types {
          id
          name
        }
      }
    }
  }
`;
