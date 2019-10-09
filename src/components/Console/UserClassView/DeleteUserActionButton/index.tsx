import React, { Component } from 'react';
import { graphql } from '@apollo/react-hoc';
import { MutationFunction } from '@apollo/react-common';
import gql from 'graphql-tag';

import { TextButton } from 'components/ui';

import { PLATFORM_QUERY } from '../../Modal/platform-query';

const DELETE_ACTION_MUTATION = gql`
  mutation DELETE_ACTION($id: ID!) {
    DeleteAction(id: $id) {
      id
    }
  }
`;

export interface Action {
  id: string;
  name: string;
  actionType: string;
}

export interface DeleteUserActionButtonProps {
  action: Action;
  userClassId: string;
  deleteAction: MutationFunction;
  platformId: string;
  updateUserClass: () => void;
}

export interface DeleteUserActionButtonState {
  showConfirmation: boolean;
  showDeleting: boolean;
}

class DeleteUserActionButton extends Component<
  DeleteUserActionButtonProps,
  DeleteUserActionButtonState
> {
  public readonly state = {
    showConfirmation: false,
    showDeleting: false,
  };

  public showConfirmationDialog = (): void =>
    this.setState({ showConfirmation: true });

  public hideConfirmationDialog = (): void =>
    this.setState({ showConfirmation: false });

  public handleDelete = async (): Promise<void> => {
    const {
      action,
      userClassId,
      deleteAction,
      platformId,
      updateUserClass,
    } = this.props;

    this.hideConfirmationDialog();
    this.setState({ showDeleting: true });

    await deleteAction({
      variables: {
        id: action.id,
      },
      update: (cache): void => {
        const { Platform } = cache.readQuery({
          query: PLATFORM_QUERY,
          variables: {
            id: platformId,
          },
        }) as { Platform: { classes: { id: string; actions: Action[] }[] }[] };

        const findUserClass = (uClass: {
          id: string;
          actions: Action[];
        }): boolean => uClass.id === userClassId;

        const userClass = Platform[0].classes.find(findUserClass);

        if (!userClass) {
          return;
        }

        userClass.actions = userClass.actions.filter(
          (userAction): boolean => userAction.id !== action.id,
        );

        cache.writeQuery({
          query: PLATFORM_QUERY,
          variables: {
            id: platformId,
          },
          data: {
            Platform,
            __typename: 'Platform',
          },
        });

        updateUserClass();
      },
    });

    this.setState({ showDeleting: false });
  };

  public render(): JSX.Element | string {
    const { showDeleting, showConfirmation } = this.state;

    if (showDeleting) {
      return 'Deleting action...';
    }

    if (showConfirmation) {
      return (
        <>
          Are you sure?{' '}
          <TextButton type="button" onClick={this.hideConfirmationDialog}>
            No
          </TextButton>{' '}
          <TextButton type="button" onClick={this.handleDelete}>
            Yes
          </TextButton>
        </>
      );
    }

    return (
      <TextButton type="button" onClick={this.showConfirmationDialog}>
        Delete
      </TextButton>
    );
  }
}

export interface Response {
  DeleteAction: {
    id: string;
  };
}

export interface Variables {
  id: string;
}

export default graphql<
  {
    action: Action;
    userClassId: string;
    platformId: string;
    updateUserClass: () => void;
  },
  Response,
  Variables,
  DeleteUserActionButtonProps
>(DELETE_ACTION_MUTATION, { name: 'deleteAction' })(DeleteUserActionButton);
