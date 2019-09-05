import gql from 'graphql-tag';

import {
  SORTING_FRAGMENT,
  CONSTRAINT_FRAGMENT,
  TREE_FRAGMENT,
} from './fragments';

export const SOURCE_QUERY = gql`
  query SOURCE($id: ID!) {
    Source(id: $id) {
      id
      name
      sortings {
        ...SortingFragment
      }
      types {
        id
        name
      }
      constraints {
        ...ConstraintFragment
      }
      tree {
        ...TreeFragment
      }
    }
  }

  ${SORTING_FRAGMENT}
  ${CONSTRAINT_FRAGMENT}
  ${TREE_FRAGMENT}
`;
