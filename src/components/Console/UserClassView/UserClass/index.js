import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from '@apollo/react-hoc';
import gql from 'graphql-tag';
import styled from 'styled-components';

import { TextButton, IdText } from 'components/ui';

import Action from '../Action';
import DeleteUserClassButton from '../DeleteUserClassButton';
import { USER_CLASS_FRAGMENT } from '../../fragments';

const IdDiv = styled.div`
  margin-top: -0.8em;
`;

const UPDATE_USERCLASS_MUTATION = gql`
  mutation UPDATE_USERCLASS($id: ID!, $name: String!) {
    userClass: UpdateUserClass(id: $id, name: $name) {
      ...UserClassParts
    }
  }

  ${USER_CLASS_FRAGMENT}
`;

class UserClass extends Component {
  state = {
    showMenu: false,
    showActions: false,
    isEditMode: false,
    isSaving: false,
  };

  static getDerivedStateFromProps(props, state) {
    if (state.prevUserClassName === props.userClass.name) {
      return null;
    }

    return {
      userClassName: props.userClass.name,
      prevUserClassName: props.userClass.name,
    };
  }

  handleMouseEnter = () => this.setState({ showMenu: true });

  handleMouseLeave = () => this.setState({ showMenu: false });

  toggleActions = () =>
    this.setState(prevState => ({
      showActions: !prevState.showActions,
    }));

  handleSaveUserClass = async () => {
    const { userClass, updateUserClassName } = this.props;
    const { userClassName } = this.state;

    if (!userClassName) {
      return this.setState({
        userClassName: userClass.name,
      });
    }

    this.setState({
      isSaving: true,
    });

    await updateUserClassName({
      variables: {
        id: userClass.id,
        name: userClassName,
      },
    });

    this.toggleEditMode();

    return this.setState({
      isSaving: false,
    });
  };

  toggleEditMode = () => {
    this.setState(prevState => ({
      isEditMode: !prevState.isEditMode,
    }));
  };

  handleInputChange = e => {
    e.preventDefault();

    this.setState({
      userClassName: e.target.value,
    });
  };

  render() {
    const {
      userClass,
      platformId,
      showActionView,
      showSourceView,
    } = this.props;
    const {
      userClassName,
      showMenu,
      showActions,
      isEditMode,
      isSaving,
    } = this.state;

    return (
      <div
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <h4>
          {isEditMode ? (
            <input
              type="text"
              value={userClassName}
              disabled={isSaving}
              onChange={this.handleInputChange}
            />
          ) : (
            userClassName
          )}
          {isEditMode && (
            <>
              <TextButton
                type="button"
                disabled={isSaving}
                onClick={this.handleSaveUserClass}
              >
                Save
              </TextButton>
              <TextButton
                type="button"
                disabled={isSaving}
                onClick={this.toggleEditMode}
              >
                Cancel
              </TextButton>
            </>
          )}
          {showMenu && !isEditMode && (
            <>
              <TextButton type="button" onClick={this.toggleEditMode}>
                Edit
              </TextButton>
              <DeleteUserClassButton
                userClassId={userClass.id}
                platformId={platformId}
                disabled={isSaving}
              />
              <TextButton type="button" onClick={this.toggleActions}>
                {showActions ? 'Hide Actions' : 'Show Actions'}
              </TextButton>
              <TextButton
                type="button"
                onClick={() => showSourceView(userClass.id)}
              >
                Sources
              </TextButton>
            </>
          )}
        </h4>

        <IdDiv>
          <IdText>{userClass.id}</IdText>
        </IdDiv>

        {showActions && (
          <div>
            <h5>
              Actions
              <TextButton
                type="button"
                onClick={() => showActionView(userClass.id)}
              >
                Add
              </TextButton>
            </h5>
            <ul>
              {userClass.actions.map(action => (
                <li key={action.id}>
                  <Action
                    key={action.id}
                    userClassId={userClass.id}
                    action={action}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
}

UserClass.propTypes = {
  userClass: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    actions: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  platformId: PropTypes.string.isRequired,
  updateUserClassName: PropTypes.func.isRequired,
  showActionView: PropTypes.func.isRequired,
  showSourceView: PropTypes.func.isRequired,
};

export default graphql(UPDATE_USERCLASS_MUTATION, {
  name: 'updateUserClassName',
})(UserClass);
