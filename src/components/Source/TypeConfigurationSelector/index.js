import React from 'react';
import PropTypes from 'prop-types';

import RenameTypePanel from './RenameTypePanel';
import AddTypePanel from './AddTypePanel';
import ConstraintPanel from './ConstraintPanel';
import SortingPanel from './SortingPanel';
import RemoveTypePanel from './RemoveTypePanel';

export const panels = {
  RENAME: 'RENAME',
  ADD_NODE: 'ADD_NODE',
  CONSTRAIN: 'CONSTRAIN',
  SORT_BY: 'SORT_BY',
  REMOVE_NODE: 'REMOVE_NODE',
};

const ComponentSelector = {
  [panels.RENAME]: RenameTypePanel,
  [panels.ADD_NODE]: AddTypePanel,
  [panels.CONSTRAIN]: ConstraintPanel,
  [panels.SORT_BY]: SortingPanel,
  [panels.REMOVE_NODE]: RemoveTypePanel,
};

function TypeConfigurationSelector({ panel, ...props }) {
  if (!panel || !Object.prototype.hasOwnProperty.call(panels, panel)) {
    return <div>Error: Invalid panel &quot;{panel}&quot; selected!</div>;
  }

  const PanelComponent = ComponentSelector[panel];

  return <PanelComponent {...props} />;
}

TypeConfigurationSelector.propTypes = {
  panel: PropTypes.oneOf(Object.values(panels)).isRequired,
};

export default TypeConfigurationSelector;
