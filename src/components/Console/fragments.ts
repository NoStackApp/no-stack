import gql from 'graphql-tag';

export const ACTION_FRAGMENT = gql`
  fragment ActionParts on Action {
    id
    name
    actionType
  }
`;

export const USER_CLASS_FRAGMENT = gql`
  fragment UserClassParts on UserClass {
    id
    name
    actions {
      ...ActionParts
    }
  }

  ${ACTION_FRAGMENT}
`;

export const SOURCE_FRAGMENT = gql`
  fragment SourceParts on Source {
    id
    name
  }
`;

export const COLLECTION_FRAGMENT = gql`
  fragment CollectionParts on Collection {
    id
    name
    sources {
      ...SourceParts
    }
  }

  ${SOURCE_FRAGMENT}
`;
