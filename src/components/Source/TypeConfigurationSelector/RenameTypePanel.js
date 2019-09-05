import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from '@apollo/react-hoc';
import gql from 'graphql-tag';
import styled from 'styled-components';

const RENAME_TYPE_MUTATION = gql`
  mutation RENAME_TYPE_MUTATION($id: ID!, $newName: String!) {
    result: UpdateType(id: $id, name: $newName) {
      id
      name
    }
  }
`;

const Wrapper = styled.div`
  margin: 1.5em;
  text-align: center;
`;

const MessageDiv = styled.div`
  color: #cb1c1c;
`;

class RenameTypePanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentName: props.type.name,
      processing: false,
    };
  }

  handleChange = e => {
    this.setState({
      currentName: e.target.value,
    });
  };

  updateTypeName = async () => {
    const { currentName } = this.state;
    const { type, renameType } = this.props;

    if (!currentName) {
      return;
    }

    this.setState({ processing: true });

    await renameType({
      variables: {
        id: type.id,
        newName: currentName,
      },
    });

    this.setState({ processing: false });
  };

  handleKeyPress = e => {
    if (e.charCode === 13) {
      this.updateTypeName();
    }
  };

  handleBlur = () => {
    this.updateTypeName();
  };

  render() {
    const { currentName, processing } = this.state;

    return (
      <Wrapper>
        <label htmlFor="type-name">
          Type Name:{' '}
          <input
            id="type-name"
            type="text"
            value={currentName}
            onChange={this.handleChange}
            onBlur={this.handleBlur}
            onKeyPress={this.handleKeyPress}
            disabled={processing}
          />
        </label>
        {processing && <MessageDiv>Saving...</MessageDiv>}
      </Wrapper>
    );
  }
}

RenameTypePanel.propTypes = {
  type: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
  }).isRequired,
  renameType: PropTypes.func.isRequired,
};

export default graphql(RENAME_TYPE_MUTATION, { name: 'renameType' })(
  RenameTypePanel,
);
