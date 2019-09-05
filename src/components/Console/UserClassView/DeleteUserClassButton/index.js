import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from '@apollo/react-hoc';
import gql from 'graphql-tag';

import { TextButton } from 'components/ui';

import { PLATFORM_QUERY } from '../../Modal/platform-query';

const DELETE_USER_CLASS_MUTATION = gql`
  mutation DELETE_USER_CLASS($id: ID!) {
    DeleteUserClass(id: $id) {
      id
    }
  }
`;

class DeleteUserClassButton extends Component {
  state = {
    showConfirmation: false,
    isDeleting: false,
  };

  showConfirmation = () =>
    this.setState({
      showConfirmation: true,
    });

  hideConfirmation = () =>
    this.setState({
      showConfirmation: false,
      isDeleting: false,
    });

  handleDeleteUserClass = async () => {
    const { userClassId, platformId, deleteUserClass } = this.props;

    this.setState({
      isDeleting: true,
    });

    await deleteUserClass({
      variables: {
        id: userClassId,
      },
      update: cache => {
        const { Platform } = cache.readQuery({
          query: PLATFORM_QUERY,
          variables: {
            id: platformId,
          },
        });

        Platform[0].classes = Platform[0].classes.filter(
          userClass => userClass.id !== userClassId,
        );

        cache.writeQuery({
          query: PLATFORM_QUERY,
          variables: {
            id: platformId,
          },
          data: {
            Platform,
          },
        });
      },
    });

    this.hideConfirmation();
  };

  render() {
    const { disabled } = this.props;
    const { showConfirmation, isDeleting } = this.state;

    if (!showConfirmation) {
      return (
        <TextButton
          type="button"
          disabled={disabled}
          onClick={this.showConfirmation}
        >
          Delete
        </TextButton>
      );
    }

    return (
      <>
        Are you sure?{' '}
        <TextButton
          type="button"
          disabled={disabled || isDeleting}
          onClick={this.hideConfirmation}
        >
          No
        </TextButton>{' '}
        <TextButton
          type="button"
          disabled={disabled || isDeleting}
          onClick={this.handleDeleteUserClass}
        >
          Yes
        </TextButton>
      </>
    );
  }
}

DeleteUserClassButton.propTypes = {
  userClassId: PropTypes.string.isRequired,
  platformId: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  deleteUserClass: PropTypes.func.isRequired,
};

DeleteUserClassButton.defaultProps = {
  disabled: false,
};

export default graphql(DELETE_USER_CLASS_MUTATION, { name: 'deleteUserClass' })(
  DeleteUserClassButton,
);
