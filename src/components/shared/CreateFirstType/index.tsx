import React, { Component } from 'react';
import styled from 'styled-components';

import { TextButton } from 'components/ui';

import CreateFirstTypeForm from '../CreateFirstTypeForm';
import AddExistingAsFirstType from '../AddExistingAsFirstType';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
`;

enum modes {
  CREATE_NEW,
  ADD_EXISTING,
}

export interface CreateFirstTypeProps {
  treeId: string;
}

export interface CreateFirstTypeState {
  mode: modes | null;
}

class CreateFirstType extends Component<
  CreateFirstTypeProps,
  CreateFirstTypeState
> {
  public readonly state = {
    mode: null,
  };

  public render(): JSX.Element {
    const { mode } = this.state;
    const { treeId } = this.props;

    if (mode === modes.CREATE_NEW) {
      return <CreateFirstTypeForm treeId={treeId} />;
    }

    if (mode === modes.ADD_EXISTING) {
      return <AddExistingAsFirstType treeId={treeId} />;
    }

    return (
      <Wrapper>
        <h4>Source has no types yet.</h4>
        <div>
          <TextButton
            type="button"
            onClick={(): void => this.setState({ mode: modes.CREATE_NEW })}
          >
            Create New
          </TextButton>
          <TextButton
            type="button"
            onClick={(): void => this.setState({ mode: modes.ADD_EXISTING })}
          >
            Add Existing
          </TextButton>
        </div>
      </Wrapper>
    );
  }
}

export default CreateFirstType;
