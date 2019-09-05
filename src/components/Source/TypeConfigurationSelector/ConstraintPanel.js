import React, { Component } from 'react';
import { graphql } from '@apollo/react-hoc';
import gql from 'graphql-tag';
import styled from 'styled-components';

const CREATE_CONSTRAINT_MUTATION = gql`
  mutation CREATE_CONSTRAINT_MUTATION(
    $id: ID!
    $value: String!
    $constraintType: ConstraintType!
    $typeId: ID!
    $sourceId: ID!
  ) {
    CreateConstraint(id: $id, value: $value, constrainttype: $constraintType) {
      id
    }

    AddConstraintType(constraintid: $id, typeid: $typeId) {
      id
    }

    AddConstraintSource(constraintid: $id, sourceid: $sourceId) {
      id
    }
  }
`;

const Wrapper = styled.div``;

class ConstraintPanel extends Component {
  state = {
    value: '',
    constraintType: 'ID',
    processing: false,
  };

  handleValueFieldChange = e => {
    this.setState({ value: e.target.value });
  };

  handleConstraintTypeSelect = e => {
    this.setState({ constraintType: e.target.value });
  };

  handleSubmit = e => {
    const { type, source, createConstraint } = this.props;
    const { value, constraintType } = this.state;

    e.preventDefault();

    this.setState({ processing: true });

    console.log(type, source, createConstraint, value, constraintType);

    this.setState({ processing: false });
  };

  render() {
    const { value, processing } = this.state;

    return (
      <Wrapper>
        <form onSubmit={this.handleSubmit}>
          <div>
            <label htmlFor="constraint-value">
              Constraint Value:{' '}
              <input
                id="constraint-value"
                type="text"
                value={value}
                onChange={this.handleValueFieldChange}
                disabled={processing}
              />
            </label>
          </div>
          <div>
            Constraint Type:{' '}
            <select
              id="constraint-type"
              onChange={this.handleConstraintTypeSelect}
            >
              <option value="ID">ID</option>
              <option value="VALUE">VALUE</option>
            </select>
          </div>
          <div>
            <button type="submit">Add Constraint</button>
          </div>
        </form>
      </Wrapper>
    );
  }
}

export default graphql(CREATE_CONSTRAINT_MUTATION, {
  name: 'createConstraint',
})(ConstraintPanel);
