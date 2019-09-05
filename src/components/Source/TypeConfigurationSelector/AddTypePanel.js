import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import NewTypeForm from '../NewTypeForm';
import AddExistingTypePanel from '../AddExistingTypePanel';

const Wrapper = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: center;
  margin: 2em 0;
`;

const Button = styled.button`
  width: 60%;
  padding: 1em;
  margin: 1em 2em;
  cursor: pointer;
`;

const AddTypePanelModes = {
  ADD_NEW: 'ADD_NEW',
  ADD_EXISTING: 'ADD_EXISTING',
};

class AddTypePanel extends Component {
  state = {
    mode: null,
  };

  setMode = mode => this.setState({ mode });

  renderButton = (buttonText, mode) => (
    <div>
      <Button type="button" onClick={() => this.setMode(mode)}>
        {buttonText}
      </Button>
    </div>
  );

  render() {
    const { type, source } = this.props;
    const { mode } = this.state;

    if (mode === AddTypePanelModes.ADD_EXISTING) {
      return (
        <AddExistingTypePanel parentTypeId={type.id} treeId={source.tree.id} />
      );
    }

    if (mode === AddTypePanelModes.ADD_NEW) {
      return <NewTypeForm parentType={type} treeId={source.tree.id} />;
    }

    return (
      <Wrapper>
        {this.renderButton(
          'Add an Existing Type',
          AddTypePanelModes.ADD_EXISTING,
        )}
        {this.renderButton('Add a New Type', AddTypePanelModes.ADD_NEW)}
      </Wrapper>
    );
  }
}

AddTypePanel.propTypes = {
  type: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
  }).isRequired,
  source: PropTypes.shape({
    id: PropTypes.string,
    tree: PropTypes.shape({
      id: PropTypes.string,
      root: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
      }),
    }),
  }).isRequired,
};

export default AddTypePanel;
