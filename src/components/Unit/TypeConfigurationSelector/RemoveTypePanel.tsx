import React, { FunctionComponent } from 'react';
import gql from 'graphql-tag';

export const REMOVE_TYPE_MUTATION = gql`
  mutation REMOVE_TYPE($typeId: ID!, $parentId: ID!, $treeId: ID!) {
    RemoveType(typeId: $typeId, parentId: $parentId, treeId: $treeId)
  }
`;

export interface RemoveTypePanelPropsInterface {
  type: {
    id: string;
    name: string;
  };
}

const RemoveTypePanel: FunctionComponent<RemoveTypePanelPropsInterface> = ({
  type,
}): JSX.Element => {
  return (
    <div>
      <div>This will delete {type.name} from all Sources. Are you sure?</div>
      <div>
        <button type="button">No</button>
        <button type="button">Yes</button>
      </div>
    </div>
  );
};

export default RemoveTypePanel;
