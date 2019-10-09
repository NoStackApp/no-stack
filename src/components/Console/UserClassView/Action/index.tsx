import React, { Component } from 'react';
import styled from 'styled-components';

import { IdText } from 'components/ui';
import DeleteUserActionButton from '../DeleteUserActionButton';

const Wrapper = styled.div`
  margin-bottom: 0.8em;
`;

export interface ActionInterface {
  id: string;
  name: string;
  actionType: string;
}

export interface ActionProps {
  action: ActionInterface;
  userClassId: string;
  platformId: string;
  updateUserClass: () => void;
}

export interface ActionState {
  showMenu: boolean;
}

class Action extends Component<ActionProps, ActionState> {
  public readonly state = {
    showMenu: false,
  };

  public handleMouseEnter = (): void => this.setState({ showMenu: true });

  public handleMouseLeave = (): void => this.setState({ showMenu: false });

  public handleDelete = (): void => {};

  public render(): JSX.Element {
    const { action, userClassId, platformId, updateUserClass } = this.props;
    const { showMenu } = this.state;

    return (
      <Wrapper
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <div>
          {action.name}
          {showMenu && (
            <DeleteUserActionButton
              action={action}
              userClassId={userClassId}
              platformId={platformId}
              updateUserClass={updateUserClass}
            />
          )}
        </div>
        <div>
          <IdText>{action.id}</IdText>
        </div>
      </Wrapper>
    );
  }
}

export default Action;
