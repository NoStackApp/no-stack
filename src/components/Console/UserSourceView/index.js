import React, { Component } from 'react';
import { Query } from '@apollo/react-components';
import { graphql } from '@apollo/react-hoc';
import gql from 'graphql-tag';
import { v4 } from 'uuid';

import { TextButton } from 'components/ui';

import { COLLECTION_FRAGMENT, SOURCE_FRAGMENT } from '../fragments';
import AddSourceForm from './AddSourceForm';
import Source from './Source';

const USER_CLASS_COLLECTION_QUERY = gql`
  query USER_CLASS_COLLECTION($id: ID) {
    UserClass(id: $id) {
      id
      name
      collection {
        ...CollectionParts
      }
    }
  }

  ${COLLECTION_FRAGMENT}
`;

const CREATE_SOURCE_MUTATION = gql`
  mutation CREATE_SOURCE(
    $id: ID!
    $name: String!
    $collectionId: ID!
    $treeId: ID!
  ) {
    CreateSource(id: $id, name: $name) {
      ...SourceParts
    }

    AddSourceCollection(sourceid: $id, collectionid: $collectionId) {
      ...SourceParts
    }

    CreateTree(id: $treeId) {
      id
    }

    AddSourceTree(sourceid: $id, treeid: $treeId) {
      ...SourceParts
    }
  }

  ${SOURCE_FRAGMENT}
`;

class UserSourceView extends Component {
  state = {
    newSourceName: '',
    isFormVisible: false,
    isSubmitting: false,
  };

  showSourceForm = () => this.setState({ isFormVisible: true });

  hideSourceForm = () => this.setState({ isFormVisible: false });

  handleFormChange = e => {
    e.preventDefault();

    this.setState({
      newSourceName: e.target.value,
    });
  };

  handleCreateSource = collectionId => async e => {
    const { newSourceName } = this.state;
    const { createSource, userClassId } = this.props;

    e.preventDefault();

    const newSourceId = v4();
    const newTreeId = v4();

    this.setState({ isSubmitting: true });

    await createSource({
      variables: {
        id: newSourceId,
        name: newSourceName,
        collectionId,
        treeId: newTreeId,
      },
      update: cache => {
        const { UserClass } = cache.readQuery({
          query: USER_CLASS_COLLECTION_QUERY,
          variables: {
            id: userClassId,
          },
        });

        UserClass[0].collection[0].sources.push({
          id: newSourceId,
          name: newSourceName,
          __typename: 'Source',
        });

        cache.writeQuery({
          query: USER_CLASS_COLLECTION_QUERY,
          variables: {
            id: userClassId,
          },
          data: { UserClass },
        });
      },
    });

    this.setState({ isSubmitting: false });

    this.hideSourceForm();
  };

  render() {
    const { userClassId, goBack } = this.props;
    const { isFormVisible, isSubmitting, newSourceName } = this.state;

    return (
      <Query
        query={USER_CLASS_COLLECTION_QUERY}
        variables={{ id: userClassId }}
      >
        {({ loading, error, data }) => {
          if (loading) {
            return 'Loading...';
          }

          if (error) {
            return 'Something went wrong.';
          }

          const userClass = data.UserClass[0];

          if (!userClass.collection || userClass.collection.length < 1) {
            return (
              <div id={userClassId}>
                <TextButton type="button" onClick={goBack}>
                  Back to User Class List
                </TextButton>
                <h4>
                  Sorry, cannot read or add {userClass.name}&apos;s Sources.
                </h4>
              </div>
            );
          }

          const collection = userClass.collection[0];

          return (
            <div id={userClassId}>
              <TextButton type="button" onClick={goBack}>
                Back to User Class List
              </TextButton>
              <h2>
                {userClass.name} Sources
                {!isFormVisible && (
                  <TextButton type="button" onClick={this.showSourceForm}>
                    Add
                  </TextButton>
                )}
              </h2>

              {isFormVisible && !isSubmitting && (
                <AddSourceForm
                  sourceName={newSourceName}
                  onChange={this.handleFormChange}
                  onSubmit={this.handleCreateSource(collection.id)}
                  disabled={isSubmitting}
                  onCancel={this.hideSourceForm}
                />
              )}

              {isSubmitting && <div>Creating new Collection...</div>}

              <ul>
                {collection.sources.length > 0 ? (
                  collection.sources.map(source => (
                    <li key={source.id}>
                      <Source source={source} />
                    </li>
                  ))
                ) : (
                  <li>No sources yet.</li>
                )}
              </ul>
            </div>
          );
        }}
      </Query>
    );
  }
}

export default graphql(CREATE_SOURCE_MUTATION, {
  name: 'createSource',
})(UserSourceView);
