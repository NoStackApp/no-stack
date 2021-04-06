import React from 'react';

import { User } from '../NoStackContext';

import Popup from './Popup';
import InfoTree from './InfoTree';
import TypeTree from './TypeTree';

interface UnitInspectorInterface {
  id: string;
  currentUser?: User | null;
}

const UnitInspector: React.FunctionComponent<UnitInspectorInterface> = ({
  id,
  currentUser,
}): JSX.Element | null => {
  if (!currentUser || !currentUser.role || currentUser.role !== 'MODERATOR') {
    return null;
  }

  return (
    <Popup id={id}>
      {({ unit }): JSX.Element => (
        <InfoTree unit={unit}>
          <TypeTree unit={unit} />
        </InfoTree>
      )}
    </Popup>
  );
};

export default UnitInspector;
