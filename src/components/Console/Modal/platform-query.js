import gql from 'graphql-tag';

import { USER_CLASS_FRAGMENT } from '../fragments';

export const PLATFORM_QUERY = gql`
  query PLATFORM_QUERY($id: ID!) {
    Platform(id: $id) {
      id
      name
      classes {
        ...UserClassParts
      }
    }
  }

  ${USER_CLASS_FRAGMENT}
`;
