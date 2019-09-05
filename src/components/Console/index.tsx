import React, { Component, MouseEvent } from 'react';
import styled from 'styled-components';

import { NoStackConsumer } from '../NoStackContext';

import Modal from './Modal';

const Button = styled.button<{ position: Position }>`
  position: fixed;
  z-index: 999999;
  ${(props): Position => props.position}: 1em;
  bottom: 1em;
  opacity: 0.4;
  cursor: pointer;

  &:hover {
    opacity: 1;
  }
`;

export enum Position {
  left,
  right,
}

export interface ConsoleProps {
  position: Position;
}

export interface ConsoleState {
  showConsole: boolean;
}

export class Console extends Component<ConsoleProps, ConsoleState> {
  public readonly state = {
    showConsole: false,
  };

  public static defaultProps = {
    position: 'left',
  };

  private handleButtonClick = (e: MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();

    this.setState({
      showConsole: true,
    });
  };

  public handleHideConsole = (): void => {
    this.setState({
      showConsole: false,
    });
  };

  public render(): JSX.Element {
    const { showConsole } = this.state;
    const { position } = this.props;

    return (
      <NoStackConsumer>
        {({ currentUser, platformId }): JSX.Element | null => {
          if (
            !currentUser ||
            !currentUser.role ||
            currentUser.role !== 'MODERATOR'
          ) {
            return null;
          }

          if (!showConsole) {
            return (
              <Button
                position={position}
                type="button"
                onClick={this.handleButtonClick}
              >
                &lt; &gt;
              </Button>
            );
          }

          return (
            <Modal platformId={platformId} onHide={this.handleHideConsole} />
          );
        }}
      </NoStackConsumer>
    );
  }
}
