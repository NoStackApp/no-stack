import React, { Component } from 'react';
import PropTypes from 'prop-types';
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

class Modal extends Component {
  constructor(props) {
    super(props);

    this.wrapperRef = React.createRef();
  }

  state = {};

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  handleClickOutside = event => {
    const { onHide } = this.props;

    if (this.wrapperRef && !this.wrapperRef.current.contains(event.target)) {
      onHide();
    }
  };

  render() {
    const { onHide, platformId } = this.props;

    return (
      <ConsoleWrapper>
        <Container ref={this.wrapperRef}>
          <CloseButton type="button" onClick={() => onHide()}>
            X
          </CloseButton>
          <h1>no-stack console</h1>
          <Content>
            <Query query={PLATFORM_QUERY} variables={{ id: platformId }}>
              {({ loading, error, data }) => {
                if (loading) {
                  return 'Loading...';
                }

                if (error) {
                  return 'Something went wrong.';
                }

                if (!data || !data.Platform) {
                  return 'Failed to retrieve platform data.';
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

Modal.propTypes = {
  onHide: PropTypes.func,
  platformId: PropTypes.string.isRequired,
};

Modal.defaultProps = {
  onHide: () => {},
};

export default Modal;
