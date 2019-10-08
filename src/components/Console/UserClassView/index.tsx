import React, { Component, SyntheticEvent } from 'react';
import { v4 } from 'uuid';
import { graphql } from '@apollo/react-hoc';
import { MutationFunction } from '@apollo/react-common';
import gql from 'graphql-tag';

import { TextButton, IdText } from 'components/ui';

import UserClass from './UserClass';
import AddUserClassForm from './AddUserClassForm';
import { COLLECTION_FRAGMENT } from '../fragments';
import { View } from '../ViewSwitcher';

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

interface Action {
  id: string;
  name: string;
}

interface UserClass {
  id: string;
  name: string;
  actions: Action[];
}

interface UserClassViewProps {
  platformData: {
    id: string;
    name: string;
    classes: UserClass[];
  };
  changeView: (view: View, props: { userClassId: string }) => void;
  views: {
    USER_SOURCE_VIEW: View;
    USER_ACTION_VIEW: View;
  };
  addUserClass: MutationFunction;
}

interface UserClassViewState {
  isFormVisible: boolean;
  newUserClassName: string;
  isSubmitting: boolean;
}

class UserClassView extends Component<UserClassViewProps, UserClassViewState> {
  public readonly state = {
    isFormVisible: false,
    newUserClassName: '',
    isSubmitting: false,
  };

  public showActionView = (userClassId: string): void => {
    const { changeView, views } = this.props;

    changeView(views.USER_ACTION_VIEW, { userClassId });
  };

  public showSourceView = (userClassId: string): void => {
    const { changeView, views } = this.props;

    changeView(views.USER_SOURCE_VIEW, { userClassId });
  };

  public showForm = (): void =>
    this.setState({
      isFormVisible: true,
      newUserClassName: '',
    });

  public hideForm = (): void =>
    this.setState({
      isFormVisible: false,
      isSubmitting: false,
    });

  public handleFormChange = (e: SyntheticEvent): void => {
    e.preventDefault();

    this.setState({
      newUserClassName: (e.target as HTMLInputElement).value,
    });
  };

  public handleCreateUserClass = async (): Promise<void> => {
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
      update: (cache, { data: { newUser } }): void => {
        const { Platform } = cache.readQuery({
          query: PLATFORM_QUERY,
          variables: { id: platformData.id },
        }) as { Platform: { classes: UserClass[] }[] };

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

  public render(): JSX.Element {
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
          {platformData.classes.map(
            (userClass): JSX.Element => (
              <li key={userClass.id}>
                <UserClass
                  userClass={userClass}
                  platformId={platformData.id}
                  showActionView={this.showActionView}
                  showSourceView={this.showSourceView}
                />
              </li>
            ),
          )}
        </ul>
      </div>
    );
  }
}

interface Source {
  id: string;
  name: string;
}

interface Collection {
  id: string;
  name: string;
  sources: Source[];
}

interface Response {
  newUser: UserClass;
  AddCollection: Collection;
  AddUserClassCollection: {
    id: string;
    name: string;
    collection: Collection[];
  };
}

interface Variables {
  id: string;
  name: string;
  platformId: string;
  collectionId: string;
  collectionName: string;
}

export default graphql<
  {
    changeView: (view: View, props: { userClassId: string }) => void;
    goBack?: () => void;
    returnToIndex?: () => void;
    views: object;
  },
  Response,
  Variables,
  UserClassViewProps
>(ADD_USER_CLASS_MUTATION, { name: 'addUserClass' })(UserClassView);
