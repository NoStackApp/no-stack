import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from '@apollo/react-hoc';
import gql from 'graphql-tag';
import styled from 'styled-components';
import { v4 } from 'uuid';

import { TREE_FRAGMENT } from '../fragments';

const Row = styled.div`
  margin: 1em 0;
`;

const ADD_TYPE_MUTATION = gql`
  mutation ADD_TYPE(
    $typeId: ID!
    $typeName: String!
    $parentId: ID!
    $assnId: ID!
    $assnName: String!
    $treeId: ID!
  ) {
    AddType(
      typeId: $typeId
      typeName: $typeName
      parentId: $parentId
      assnId: $assnId
      assnName: $assnName
      treeId: $treeId
    ) {
      id
      name
      assns {
        id
        name
        types {
          id
        }
      }
    }
  }
`;

class NewTypeForm extends Component {
  state = {
    typeName: '',
    assnName: '',
    isSubmitting: false,
    createSuccess: false,
    error: '',
  };

  handleChange = e => {
    e.preventDefault();

    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  handleSubmit = async e => {
    const { typeName, assnName } = this.state;
    const { addType, parentType, treeId } = this.props;

    e.preventDefault();

    if (!typeName || !assnName) {
      return;
    }

    this.setState({ isSubmitting: true });

    const typeId = v4();
    const assnId = v4();

    try {
      await addType({
        variables: {
          typeId,
          typeName,
          parentId: parentType.id,
          assnId,
          assnName,
          treeId,
        },
        update: cache => {
          const tree = cache.readFragment({
            id: treeId,
            fragment: TREE_FRAGMENT,
          });

          const newAssn = {
            id: assnId,
            name: assnName,
            types: [
              {
                id: typeId,
                __typename: 'Type',
              },
              {
                id: parentType.id,
                __typename: 'Type',
              },
            ],
            __typename: 'Assn',
          };

          const newNode = {
            id: typeId,
            name: typeName,
            __typename: 'Type',
          };

          tree.assns = [...tree.assns, newAssn];
          tree.nodes = [...tree.nodes, newNode];

          cache.writeFragment({
            id: treeId,
            fragment: TREE_FRAGMENT,
            data: tree,
          });
        },
      });

      this.setState({ createSuccess: true });
    } catch (error) {
      this.setState({ error: 'Something went wrong. Try again.' });
    } finally {
      this.setState({ isSubmitting: false });
    }
  };

  renderInput = (id, label, name, value) => (
    <Row>
      <label htmlFor={id}>
        <div>{label}</div>
        <div>
          <input
            id={id}
            name={name}
            type="text"
            value={value}
            onChange={this.handleChange}
          />
        </div>
      </label>
    </Row>
  );

  render() {
    const {
      typeName,
      assnName,
      isSubmitting,
      createSuccess,
      error,
    } = this.state;
    const { parentType } = this.props;

    if (createSuccess) {
      return 'Successfully created type!';
    }

    if (isSubmitting) {
      return 'Creating new type...';
    }

    return (
      <form onSubmit={this.handleSubmit}>
        <div>
          <h3>Add a New Type</h3>

          {error && <Row>{error}</Row>}

          {this.renderInput('type-name', 'Type Name', 'typeName', typeName)}

          {this.renderInput(
            'assn-name',
            `What do you want to call the relationship between this new type and ${parentType.name}?`,
            'assnName',
            assnName,
          )}

          <Row>
            <button type="submit" disabled={!typeName || !assnName}>
              Add Type
            </button>
          </Row>
        </div>
      </form>
    );
  }
}

NewTypeForm.propTypes = {
  parentType: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
  }).isRequired,
  treeId: PropTypes.string.isRequired,
  addType: PropTypes.func.isRequired,
};

export default graphql(ADD_TYPE_MUTATION, { name: 'addType' })(NewTypeForm);
