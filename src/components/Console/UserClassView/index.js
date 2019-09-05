import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { v4 } from 'uuid';
import { graphql } from '@apollo/react-hoc';
import gql from 'graphql-tag';

import { TextButton, IdText } from 'components/ui';

import UserClass from './UserClass';
import AddUserClassForm from './AddUserClassForm';
import { COLLECTION_FRAGMENT } from '../fragments';

import { PLATFORM_QUERY } from '../Modal/platform-query';

const ADD_USER_CLASS_MUTATION = gql`
  mutation ADD_USER_CLASS(
    $id: ID!
    $name: String!
    $platformId: ID!
    $collectionId: ID!
    $collectionName: String!
  ) {
    newUser: CreateUserClass(id: $id, name: $name, platformId: $platformId) {
      id
      name
      actions {
        id
        name
      }
    }

    AddCollection(
      collectionId: $collectionId
      collectionName: $collectionName
      restricted: true
    ) {
      ...CollectionParts
    }

    AddUserClassCollection(userclassid: $id, collectionid: $collectionId) {
      id
      name
      collection {
        ...CollectionParts
      }
    }
  }

  ${COLLECTION_FRAGMENT}
`;

class UserClassView extends Component {
  state = {
    isFormVisible: false,
    newUserClassName: '',
    isSubmitting: false,
  };

  showActionView = userClassId => {
    const { changeView, views } = this.props;

    changeView(views.USER_ACTION_VIEW, { userClassId });
  };

  showSourceView = userClassId => {
    const { changeView, views } = this.props;

    changeView(views.USER_SOURCE_VIEW, { userClassId });
  };

  showForm = () =>
    this.setState({
      isFormVisible: true,
      newUserClassName: '',
    });

  hideForm = () =>
    this.setState({
      isFormVisible: false,
      isSubmitting: false,
    });

  handleFormChange = e => {
    e.preventDefault();

    this.setState({
      newUserClassName: e.target.value,
    });
  };

  handleCreateUserClass = async () => {
    const { platformData, addUserClass } = this.props;
    const { newUserClassName } = this.state;

    const userTypeId = v4();
    const collectionId = v4();
    const collectionName = `${newUserClassName} collection`;

    this.setState({
      isSubmitting: true,
    });

    await addUserClass({
      variables: {
        id: userTypeId,
        name: newUserClassName,
        platformId: platformData.id,
        collectionId,
        collectionName,
      },
      update: (cache, { data: { newUser } }) => {
        const { Platform } = cache.readQuery({
          query: PLATFORM_QUERY,
          variables: { id: platformData.id },
        });

        Platform[0].classes.push(newUser);

        cache.writeQuery({
          query: PLATFORM_QUERY,
          variables: { id: platformData.id },
          data: {
            Platform,
          },
        });
      },
    });

    this.hideForm();
  };

  render() {
    const { platformData } = this.props;
    const { newUserClassName, isFormVisible, isSubmitting } = this.state;

    return (
      <div>
        <h2>
          {platformData.name} Platform <IdText>{platformData.id}</IdText>
        </h2>
        <h3>
          User Classes
          {!isFormVisible && (
            <TextButton type="button" onClick={this.showForm}>
              Add
            </TextButton>
          )}
        </h3>

        {isSubmitting
          ? 'Creating new User Class...'
          : isFormVisible && (
              <AddUserClassForm
                userClassName={newUserClassName}
                onChange={this.handleFormChange}
                onSubmit={this.handleCreateUserClass}
                onCancel={this.hideForm}
              />
            )}

        <ul>
          {platformData.classes.map(userClass => (
            <li key={userClass.id}>
              <UserClass
                userClass={userClass}
                platformId={platformData.id}
                showActionView={this.showActionView}
                showSourceView={this.showSourceView}
              />
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

UserClassView.propTypes = {
  platformData: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    classes: PropTypes.array,
  }).isRequired,
  changeView: PropTypes.func.isRequired,
  views: PropTypes.shape({
    USER_ACTION_VIEW: PropTypes.string,
    USER_SOURCE_VIEW: PropTypes.string,
  }).isRequired,
  addUserClass: PropTypes.func.isRequired,
};

export default graphql(ADD_USER_CLASS_MUTATION, { name: 'addUserClass' })(
  UserClassView,
);
