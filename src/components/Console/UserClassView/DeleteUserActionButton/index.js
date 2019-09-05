import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from '@apollo/react-hoc';
import gql from 'graphql-tag';

import { TextButton } from 'components/ui';

import { USER_CLASS_FRAGMENT } from '../../fragments';

const DELETE_ACTION_MUTATION = gql`
  mutation DELETE_ACTION($id: ID!) {
    DeleteAction(id: $id) {
      id
    }
  }
`;

class DeleteUserActionButton extends Component {
  state = {
    showConfirmation: false,
    showDeleting: false,
  };

  showConfirmationDialog = () => this.setState({ showConfirmation: true });

  hideConfirmationDialog = () => this.setState({ showConfirmation: false });

  handleDelete = async () => {
    const { action, userClassId, deleteAction } = this.props;

    this.hideConfirmationDialog();
    this.setState({ showDeleting: true });

    await deleteAction({
      variables: {
        id: action.id,
      },
      update: cache => {
        const fragmentName = 'UserClassParts';

        const userClass = cache.readFragment({
          id: userClassId,
          fragment: USER_CLASS_FRAGMENT,
          fragmentName,
        });

        userClass.actions = userClass.actions.filter(el => el.id !== action.id);

        cache.writeFragment({
          id: userClassId,
          fragment: USER_CLASS_FRAGMENT,
          fragmentName,
          data: {
            ...userClass,
          },
        });
      },
    });

    this.setState({ showDeleting: false });
  };

  render() {
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

DeleteUserActionButton.propTypes = {
  action: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    actionType: PropTypes.string,
  }).isRequired,
  userClassId: PropTypes.string.isRequired,
  deleteAction: PropTypes.func.isRequired,
};

export default graphql(DELETE_ACTION_MUTATION, { name: 'deleteAction' })(
  DeleteUserActionButton,
);
