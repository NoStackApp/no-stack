import React, { Component, createRef } from 'react';
import styled from 'styled-components';
import { Query } from '@apollo/react-components';

import { ConsoleWrapper } from 'components/ui';

import ViewSwitcher from '../ViewSwitcher';
import { PLATFORM_QUERY } from './platform-query';

const Container = styled.div`
  position: relative;
  height: 90%;
  width: 90%;
  min-width: 640px;
  max-width: 960px;
  background-color: rgb(255, 255, 255, 1);
  padding: 1em;
  display: flex;
  flex-direction: column;
`;

const CloseButton = styled.button`
  position: absolute;
  right: 5px;
  top: 5px;
  cursor: pointer;
`;

const Content = styled.div`
  overflow: scroll;
  flex: 1;
  padding: 5px 10px;
  border: 1px #eeeeee solid;
`;

export interface ModalProps {
  onHide: () => void;
  platformId: string;
}

export interface Action {
  id: string;
  name: string;
  actionType: string;
}

export interface UserClass {
  id: string;
  name: string;
  actions: Action[];
}

export interface Platform {
  id: string;
  name: string;
  classes: UserClass[];
}

export interface QueryData {
  Platform: Platform[];
}

export interface QueryVariables {
  id: string;
}

class Modal extends Component<ModalProps, {}> {
  private wrapperRef = createRef<HTMLDivElement>();

  public componentDidMount(): void {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  public componentWillUnmount(): void {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  public handleClickOutside = (event: Event): void => {
    const { onHide } = this.props;

    const node = this.wrapperRef.current;

    if (node && !node.contains(event.target as Node)) {
      onHide();
    }
  };

  public render(): JSX.Element {
    const { onHide, platformId } = this.props;

    return (
      <ConsoleWrapper>
        <Container ref={this.wrapperRef}>
          <CloseButton type="button" onClick={(): void => onHide()}>
            &times;
          </CloseButton>
          <h1>no-stack console</h1>
          <Content>
            <Query<QueryData, QueryVariables>
              query={PLATFORM_QUERY}
              variables={{ id: platformId }}
            >
              {({ loading, error, data }): JSX.Element => {
                if (loading) {
                  return <>Loading...</>;
                }

                if (error) {
                  return <>Something went wrong.</>;
                }

                if (!data || !data.Platform) {
                  return <>Failed to retrieve platform data.</>;
                }

                return <ViewSwitcher platformData={data.Platform[0]} />;
              }}
            </Query>
          </Content>
        </Container>
      </ConsoleWrapper>
    );
  }
}

export default Modal;
