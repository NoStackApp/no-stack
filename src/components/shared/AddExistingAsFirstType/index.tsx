import React, { Component, FormEvent } from 'react';
import compose from '@shopify/react-compose';
import { graphql } from '@apollo/react-hoc';
import { Query } from '@apollo/react-components';
import { MutationFunction } from '@apollo/react-common';
import gql from 'graphql-tag';

import { TextButton } from 'components/ui';

import { TYPES_NOT_IN_TREE_QUERY } from 'components/Source/AddExistingTypePanel/queries';
import { withNoStack } from 'components/NoStackContext';

import Dropdown from '../Dropdown';

const ADD_FIRST_TYPE_MUTATION = gql`
  mutation ADD_FIRST_TYPE($treeId: ID!, $typeId: ID!) {
    AddTreeRoot(treeid: $treeId, typeid: $typeId) {
      id
      name
      root {
        id
        name
      }
    }
  }
`;

export interface AddExistingAsFirstTypeProps {
  treeId: string;
  platformId: string;
  addFirstType: MutationFunction;
}

export interface AddExistingAsFirstTypeState {
  selectedTypeId: string | null;
  isSubmitting: boolean;
}

class AddExistingAsFirstType extends Component<
  AddExistingAsFirstTypeProps,
  AddExistingAsFirstTypeState
> {
  public readonly state = {
    selectedTypeId: null,
    isSubmitting: false,
  };

  public handleSelect = (e: FormEvent<HTMLSelectElement>): void => {
    this.setState({
      selectedTypeId: (e.target as HTMLSelectElement).value,
    });
  };

  private handleCreateType = async (): Promise<void> => {
    const { selectedTypeId } = this.state;
    const { addFirstType, treeId } = this.props;

    this.setState({ isSubmitting: true });

    await addFirstType({
      variables: {
        typeId: selectedTypeId,
        treeId,
      },
    });

    this.setState({ isSubmitting: false });
  };

  public render(): JSX.Element {
    const { selectedTypeId, isSubmitting } = this.state;
    const { treeId, platformId } = this.props;

    interface Response {
      typesNotInTree: {
        id: string;
        name: string;
      }[];
    }

    interface Variables {
      treeId: string;
      platformId: string;
    }

    return (
      <div>
        <h4>Source has no types yet. Select a type to add.</h4>
        <Query<Response, Variables>
          query={TYPES_NOT_IN_TREE_QUERY}
          variables={{ treeId, platformId }}
        >
          {({ loading, error, data }): JSX.Element => {
            if (loading) {
              return <>Fetching available types...</>;
            }

            if (error) {
              return <>Something went wrong. Cannot fetch types.</>;
            }

            return (
              <Dropdown
                options={data && data.typesNotInTree}
                onSelect={this.handleSelect}
                disabled={isSubmitting}
              />
            );
          }}
        </Query>
        <TextButton
          type="button"
          disabled={!selectedTypeId || isSubmitting}
          onClick={this.handleCreateType}
        >
          Add Type
        </TextButton>
      </div>
    );
  }
}

export default compose<{ treeId: string }>(
  withNoStack,
  graphql(ADD_FIRST_TYPE_MUTATION, { name: 'addFirstType' }),
)(AddExistingAsFirstType);
