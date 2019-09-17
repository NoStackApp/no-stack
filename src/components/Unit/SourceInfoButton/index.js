import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Query } from '@apollo/react-components';
import styled from 'styled-components';

import SourceInfoTree from '../SourceInfoTree';

import { SOURCE_QUERY } from '../queries';

const Button = styled.button`
  box-sizing: border-box;
  background-color: white;
  color: red;
  font-size: 16px;
  border: 1px dashed red;
  width: 25px;
  height: 25px;
  padding: 0;
  margin: 0;
  text-align: center;
  text-decoration: none;
`;

const Wrapper = styled.div`
  direction: ltr;
`;

class SourceInfoButton extends Component {
  state = {
    isTreeVisible: false,
  };

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  toggleTree = () =>
    this.setState(prevState => ({ isTreeVisible: !prevState.isTreeVisible }));

  setWrapperRef = node => {
    this.wrapperRef = node;
  };

  handleClickOutside = event => {
    const { isTreeVisible } = this.state;

    if (!isTreeVisible) {
      return;
    }

    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.setState({ isTreeVisible: false });
    }
  };

  render() {
    const { id } = this.props;
    const { isTreeVisible } = this.state;

    return (
      <Query query={SOURCE_QUERY} variables={{ id }}>
        {({ loading, error, data }) => {
          if (loading) return null;

          if (error) return `Error: ${error.graphQLErrors}`;

          return (
            <Wrapper ref={this.setWrapperRef}>
              <Button type="button" onClick={this.toggleTree}>
                {isTreeVisible ? '-' : '+'}
              </Button>
              {isTreeVisible && <SourceInfoTree source={data.Source[0]} />}
            </Wrapper>
          );
        }}
      </Query>
    );
  }
}

SourceInfoButton.propTypes = {
  id: PropTypes.string.isRequired,
};

export default SourceInfoButton;
