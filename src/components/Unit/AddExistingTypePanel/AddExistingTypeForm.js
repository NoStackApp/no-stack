import React, { Component } from 'react';
import PropTypes from 'prop-types';
import compose from '@shopify/react-compose';
import { graphql } from '@apollo/react-hoc';
import { Query } from '@apollo/react-components';
import gql from 'graphql-tag';
import styled from 'styled-components';
import { v4 } from 'uuid';

import Dropdown from 'components/shared/Dropdown';

import { TREE_FRAGMENT } from '../fragments';
import { TYPE_ASSNS_QUERY, TYPES_NOT_IN_TREE_QUERY } from './queries';

const Wrapper = styled.div`
  margin: 1em 0;
`;

const ADD_TO_TREE_MUTATION = gql`
  mutation ADD_TO_TREE($assnId: ID!, $treeId: ID!) {
    AddToTree(assnId: $assnId, treeId: $treeId) {
      ...TreeFragment
    }
  }

  ${TREE_FRAGMENT}
`;

const ADD_ASSN_MUTATION = gql`
  mutation ADD_ASSN(
    $assnId: ID!
    $assnName: String!
    $parentTypeId: ID!
    $childTypeId: ID!
  ) {
    AddAssn(
      assnId: $assnId
      assnName: $assnName
      parentTypeId: $parentTypeId
      childTypeId: $childTypeId
    ) {
      id
      name
      types {
        id
        name
      }
    }
  }
`;

const CREATE_ASSN_ID = 'CREATE_ASSN_ID';

class CreateAssnForm extends Component {
  state = {
    selectedAssnId: null,
    newAssnName: '',
  };

  handleAssnSelect = e => {
    if (!e.target.value) {
      this.setState({ selectedAssnId: null });

      return;
    }

    this.setState({ selectedAssnId: e.target.value });
  };

  handleInputChange = e => {
    e.preventDefault();

    this.setState({
      newAssnName: e.target.value,
    });
  };

  handleCreateNewAssn = async e => {
    const {
      addToTree,
      addAssn,
      setSubmitting,
      onCreate,
      treeId,
      parentTypeId,
      childTypeId,
    } = this.props;
    const { newAssnName } = this.state;

    setSubmitting(true);

    e.preventDefault();

    const assnId = v4();

    try {
      await addAssn({
        variables: {
          assnId,
          assnName: newAssnName,
          parentTypeId,
          childTypeId,
        },
      });

      await addToTree({
        variables: {
          assnId,
          treeId,
        },
        update: (cache, { data: { AddToTree } }) => {
          cache.writeFragment({
            id: treeId,
            fragment: TREE_FRAGMENT,
            data: { ...AddToTree },
          });
        },
      });

      onCreate();
    } catch (error) {
      console.log(error);
    } finally {
      setSubmitting(false);
    }
  };

  handleUseExistingAssn = async () => {
    const {
      addToTree,
      setSubmitting,
      onCreate,
      treeId,
      childTypeId,
      platformId,
    } = this.props;
    const { selectedAssnId } = this.state;

    setSubmitting(true);

    try {
      await addToTree({
        variables: {
          assnId: selectedAssnId,
          treeId,
        },
        update: (cache, { data: { AddToTree } }) => {
          cache.writeFragment({
            id: treeId,
            fragment: TREE_FRAGMENT,
            data: { ...AddToTree },
          });

          const { typesNotInTree } = cache.readQuery({
            query: TYPES_NOT_IN_TREE_QUERY,
            variables: {
              treeId,
              platformId,
            },
          });

          cache.writeQuery({
            query: TYPES_NOT_IN_TREE_QUERY,
            variables: {
              treeId,
              platformId,
            },
            data: {
              typesNotInTree: typesNotInTree.filter(
                type => type.id !== childTypeId,
              ),
            },
          });
        },
      });

      onCreate();
    } catch (error) {
      console.log(error);
    } finally {
      setSubmitting(false);
    }
  };

  renderAddTypeWithNewAssnForm = () => {
    const { newAssnName } = this.state;
    const { isSubmitting } = this.props;

    return (
      <Wrapper>
        <form onSubmit={this.handleCreateNewAssn}>
          <div>
            <label htmlFor={CREATE_ASSN_ID}>
              Name the association:
              <input
                id={CREATE_ASSN_ID}
                type="text"
                disabled={isSubmitting}
                value={newAssnName}
                onChange={this.handleInputChange}
              />
            </label>
          </div>
          <div style={{ margin: '1em 0' }}>
            <button type="submit" disabled={isSubmitting}>
              Add Type
            </button>
          </div>
        </form>
      </Wrapper>
    );
  };

  renderAddTypeWithExistingAssnButton = () => {
    const { isSubmitting } = this.props;

    return (
      <Wrapper>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={this.handleUseExistingAssn}
        >
          Add Type
        </button>
      </Wrapper>
    );
  };

  render() {
    const { childTypeId, parentTypeId } = this.props;
    const { selectedAssnId } = this.state;

    return (
      <Query
        query={TYPE_ASSNS_QUERY}
        variables={{
          id: childTypeId,
        }}
      >
        {({ loading, error, data }) => {
          if (loading) {
            return 'Fetching associations...';
          }

          if (error) {
            return `Error: ${error.graphQLErrors}`;
          }

          // filter selected type's assns to those
          // shared with the would-be parent type
          const assns = data.Type[0].assns.filter(assn =>
            assn.types.some(type => type.id === parentTypeId),
          );

          assns.unshift({
            id: CREATE_ASSN_ID,
            name: 'Create/use a new association...',
          });

          return (
            <>
              Select an association between the two types:
              <Dropdown options={assns} onSelect={this.handleAssnSelect} />
              {selectedAssnId &&
                (selectedAssnId === CREATE_ASSN_ID
                  ? this.renderAddTypeWithNewAssnForm()
                  : this.renderAddTypeWithExistingAssnButton())}
            </>
          );
        }}
      </Query>
    );
  }
}

CreateAssnForm.propTypes = {
  childTypeId: PropTypes.string.isRequired,
  parentTypeId: PropTypes.string.isRequired,
  treeId: PropTypes.string.isRequired,
  platformId: PropTypes.string.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  setSubmitting: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  addToTree: PropTypes.func.isRequired,
  addAssn: PropTypes.func.isRequired,
};

export default compose(
  graphql(ADD_TO_TREE_MUTATION, { name: 'addToTree' }),
  graphql(ADD_ASSN_MUTATION, { name: 'addAssn' }),
)(CreateAssnForm);
