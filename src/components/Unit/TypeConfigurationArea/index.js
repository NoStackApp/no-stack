import React, { Component } from 'react';
import styled from 'styled-components';

import TypeConfigurationSelector, {
  panels,
} from '../TypeConfigurationSelector';

const Wrapper = styled.div`
  padding: 0.5em;
`;

const Header = styled.h1`
  font-size: 1.5rem;
  padding: 0.5em;
  background-color: #ffffff;
  border-radius: 5px;
`;

const ContentDiv = styled.div`
  background-color: #ffffff;
  padding: 0.5em;
  margin: 1em;
  border-radius: 0.5em;
  min-height: 250px;
`;

const MenuDiv = styled.div`
  margin: 0.3em;
  text-align: center;
`;

const MenuButton = styled.button`
  padding: 0.5em;
`;

class TypeConfigurationArea extends Component {
  state = {
    selectedPanel: null,
  };

  handleButtonClick = e => this.setState({ selectedPanel: e.target.value });

  render() {
    const { type, source } = this.props;
    const { selectedPanel } = this.state;

    return (
      <Wrapper>
        <Header>Configuring {type.name}</Header>
        <MenuDiv>
          <MenuButton
            type="button"
            value={panels.RENAME}
            onClick={this.handleButtonClick}
          >
            Rename
          </MenuButton>
          <MenuButton
            type="button"
            value={panels.ADD_NODE}
            onClick={this.handleButtonClick}
          >
            Add Associated Type
          </MenuButton>
          <MenuButton
            type="button"
            value={panels.CONSTRAIN}
            onClick={this.handleButtonClick}
          >
            Constrain
          </MenuButton>
          <MenuButton
            type="button"
            value={panels.SORT_BY}
            onClick={this.handleButtonClick}
          >
            Sort By
          </MenuButton>
          <MenuButton
            type="button"
            value={panels.REMOVE_NODE}
            onClick={this.handleButtonClick}
          >
            Remove
          </MenuButton>
        </MenuDiv>
        {selectedPanel && (
          <ContentDiv>
            <TypeConfigurationSelector
              panel={selectedPanel}
              type={type}
              source={source}
            />
          </ContentDiv>
        )}
      </Wrapper>
    );
  }
}

export default TypeConfigurationArea;
