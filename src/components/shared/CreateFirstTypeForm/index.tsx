import React, { Component, ChangeEvent, FormEvent } from 'react';
import { MutationFunction } from '@apollo/react-common';
import { graphql } from '@apollo/react-hoc';
import gql from 'graphql-tag';
import { v4 } from 'uuid';

import { TextButton } from 'components/ui';
import { TREE_FRAGMENT } from 'components/Source/fragments';

const CREATE_FIRST_TYPE_MUTATION = gql`
  mutation CREATE_FIRST_TYPE($id: ID!, $name: String!, $treeId: ID!) {
    AddRootType(typeId: $id, typeName: $name, treeId: $treeId) {
      id
      name
    }
  }
`;

export interface CreateFirstTypeFormProps {
  treeId: string;
  createFirstType: MutationFunction;
}

export interface CreateFirstTypeFormState {
  typeName: string;
  isSubmitting: boolean;
}

class CreateFirstTypeForm extends Component<
  CreateFirstTypeFormProps,
  CreateFirstTypeFormState
> {
  public readonly state = {
    typeName: '',
    isSubmitting: false,
  };

  private handleInputChange = (e: ChangeEvent<HTMLInputElement>): void =>
    this.setState({
      typeName: e.target.value,
    });

  private handleSubmit = async (
    e: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    const { treeId, createFirstType } = this.props;
    const { typeName } = this.state;

    e.preventDefault();

    if (!typeName) {
      return;
    }

    this.setState({ isSubmitting: true });

    const id = v4();

    try {
      await createFirstType({
        variables: {
          id,
          name: typeName,
          treeId,
        },
        update: (cache): void => {
          const treeFragment = cache.readFragment({
            id: treeId,
            fragment: TREE_FRAGMENT,
          }) as { root: { id: string; typeName: string } };

          treeFragment.root = {
            id,
            typeName,
          };

          cache.writeFragment({
            id: treeId,
            fragment: TREE_FRAGMENT,
            data: treeFragment,
          });
        },
      });
    } catch (error) {
      console.log(error);
    }

    this.setState({ isSubmitting: false });
  };

  public render(): JSX.Element {
    const { typeName, isSubmitting } = this.state;

    return (
      <div>
        <h4>Source has no types yet. Add a type first.</h4>
        <form onSubmit={this.handleSubmit}>
          <label htmlFor="type-name">
            Type Name:
            <input
              id="type-name"
              type="text"
              value={typeName}
              onChange={this.handleInputChange}
              disabled={isSubmitting}
              style={{
                margin: '0.5em',
              }}
            />
          </label>
          <TextButton type="submit" disabled={!typeName || isSubmitting}>
            Add Type
          </TextButton>
        </form>
      </div>
    );
  }
}

export interface Response {
  AddRootType: {
    id: string;
    name: string;
  };
}

export interface Variables {
  id: string;
  name: string;
  treeId: string;
}

export default graphql<
  { treeId: string },
  Response,
  Variables,
  CreateFirstTypeFormProps
>(CREATE_FIRST_TYPE_MUTATION, { name: 'createFirstType' })(CreateFirstTypeForm);
