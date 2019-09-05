import gql from 'graphql-tag';

export const SORTING_FRAGMENT = gql`
  fragment SortingFragment on Sorting {
    id
    order
    type {
      id
      name
    }
  }
`;

export const CONSTRAINT_FRAGMENT = gql`
  fragment ConstraintFragment on Constraint {
    id
    value
    type {
      id
      name
    }
  }
`;

export const TREE_FRAGMENT = gql`
  fragment TreeFragment on Tree {
    id
    name
    root {
      id
      name
    }
    assns {
      id
      name
      types {
        id
      }
    }
    nodes {
      id
      name
    }
    root {
      id
      name
    }
  }
`;
