import React, { Component } from 'react';

import Dropdown from 'components/shared/Dropdown';
import TypeConfigurationArea from '../TypeConfigurationArea';

class SourceControlPanel extends Component {
  state = {
    selectedType: null,
  };

  getNodes = () => {
    const {
      source: { tree },
    } = this.props;

    return tree.nodes && tree.nodes.length > 0
      ? tree.nodes.reduce(
          (arr, node) =>
            arr.find(el => el.id === node.id) ? arr : arr.concat([node]),
          [],
        )
      : [tree.root];
  };

  handleSelect = e => {
    if (!e.target.value) {
      this.setState({ selectedType: null });

      return;
    }

    const treeNodes = this.getNodes();

    const selectedType = treeNodes.find(el => el.id === e.target.value);

    this.setState({ selectedType });
  };

  render() {
    const { source, ContentRow } = this.props;
    const { selectedType } = this.state;

    const treeNodes = this.getNodes();

    return (
      <div>
        Select a type to modify:
        <Dropdown options={treeNodes} onSelect={this.handleSelect} />
        {selectedType && (
          <ContentRow>
            <TypeConfigurationArea
              key={selectedType.id}
              type={selectedType}
              source={source}
            />
          </ContentRow>
        )}
      </div>
    );
  }
}

export default SourceControlPanel;
