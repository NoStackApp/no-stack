import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Query } from '@apollo/react-components';
import styled from 'styled-components';

import Dropdown from 'components/shared/Dropdown';

import { withNoStack } from '../../NoStackContext';
import AddExistingTypeForm from './AddExistingTypeForm';
import { TYPES_NOT_IN_TREE_QUERY } from './queries';

const Wrapper = styled.div`
  margin: 1em;
`;

const Row = styled.div`
  margin: 1em 0;
`;

class AddExistingTypePanel extends Component {
  state = {
    selectedTypeId: null,
    isSubmitting: false,
    createSuccess: false,
  };

  handleTypeSelect = e => {
    if (!e.target.value) {
      this.setState({ selectedTypeId: null });

      return;
    }

    this.setState({
      selectedTypeId: e.target.value,
    });
  };

  setSubmitting = isSubmitting => this.setState({ isSubmitting });

  setCreateSuccess = () => this.setState({ createSuccess: true });

  render() {
    const { isSubmitting, createSuccess, selectedTypeId } = this.state;
    const { treeId, platformId, parentTypeId } = this.props;

    if (createSuccess) {
      return 'Successfully added type.';
    }

    return (
      <Query query={TYPES_NOT_IN_TREE_QUERY} variables={{ treeId, platformId }}>
        {({ loading, error, data }) => {
          if (loading) {
            return <Wrapper>Retrieving types...</Wrapper>;
          }

          if (error) {
            return <Wrapper>Error: {error.graphQLErrors}</Wrapper>;
          }

          return (
            <Wrapper>
              <Row>
                Select a type to add:
                <Dropdown
                  options={data.typesNotInTree}
                  onSelect={this.handleTypeSelect}
                  disabled={isSubmitting}
                />
              </Row>
              {selectedTypeId && (
                <Row>
                  <AddExistingTypeForm
                    childTypeId={selectedTypeId}
                    parentTypeId={parentTypeId}
                    treeId={treeId}
                    platformId={platformId}
                    isSubmitting={isSubmitting}
                    setSubmitting={this.setSubmitting}
                    onCreate={this.setCreateSuccess}
                  />
                </Row>
              )}
            </Wrapper>
          );
        }}
      </Query>
    );
  }
}

AddExistingTypePanel.propTypes = {
  parentTypeId: PropTypes.string.isRequired,
  treeId: PropTypes.string.isRequired,
  platformId: PropTypes.string.isRequired,
};

export default withNoStack(AddExistingTypePanel);
