import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { IdText } from 'components/ui';
import DeleteUserActionButton from '../DeleteUserActionButton';

const Wrapper = styled.div`
  margin-bottom: 0.8em;
`;

class Action extends Component {
  state = {
    showMenu: false,
  };

  handleMouseEnter = () => this.setState({ showMenu: true });

  handleMouseLeave = () => this.setState({ showMenu: false });

  handleDelete = () => {};

  render() {
    const { action, userClassId } = this.props;
    const { showMenu } = this.state;

    return (
      <Wrapper
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <div>
          {action.name}
          {showMenu && (
            <DeleteUserActionButton action={action} userClassId={userClassId} />
          )}
        </div>
        <div>
          <IdText>{action.id}</IdText>
        </div>
      </Wrapper>
    );
  }
}

Action.propTypes = {
  action: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    actionType: PropTypes.string,
  }).isRequired,
  userClassId: PropTypes.string.isRequired,
};

export default Action;
