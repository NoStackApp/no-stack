import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from '@apollo/react-hoc';
import { Query } from '@apollo/react-components';
import styled from 'styled-components';
import gql from 'graphql-tag';

import CreateFirstType from 'components/shared/CreateFirstType';
import { IdText, TextButton } from 'components/ui';

import { SOURCE_QUERY } from 'components/Unit/queries';
import SourceTypeTree from 'components/Unit/SourceTypeTree';
import SourceControlPanel from 'components/Unit/SourceControlPanel';

const Wrapper = styled.div`
  margin-bottom: 0.8em;
`;

const Header = styled.h4`
  margin-bottom: 0.2em;
`;

const Row = styled.div`
  margin: 1em auto;
  padding: 1em;
  border-radius: 3px;
  background-color: #e6e0e0;
  text-align: center;
`;

const UPDATE_SOURCE_NAME_MUTATION = gql`
  mutation UPDATE_SOURCE_NAME($id: ID!, $name: String!) {
    UpdateSource(id: $id, name: $name) {
      id
      name
    }
  }
`;

class Source extends Component {
  state = {
    showMenu: false,
    showControlPanel: false,
    isEditMode: false,
    isSaving: false,
  };

  static getDerivedStateFromProps(props, state) {
    if (state.prevSourceName === props.source.name) {
      return null;
    }

    return {
      sourceName: props.source.name,
      prevSourceName: props.source.name,
    };
  }

  handleMouseEnter = () => this.setState({ showMenu: true });

  handleMouseLeave = () => this.setState({ showMenu: false });

  toggleControlPanel = () =>
    this.setState(prevState => ({
      showControlPanel: !prevState.showControlPanel,
    }));

  toggleEditMode = async () => {
    this.setState(prevState => ({
      isEditMode: !prevState.isEditMode,
    }));
  };

  handleInputChange = e => {
    e.preventDefault();

    this.setState({
      sourceName: e.target.value,
    });
  };

  handleSaveSourceName = async () => {
    const { source, updateSourceName } = this.props;
    const { sourceName } = this.state;

    if (!sourceName) {
      return this.setState({
        sourceName: source.name,
      });
    }

    this.setState({
      isSaving: true,
    });

    await updateSourceName({
      variables: {
        id: source.id,
        name: sourceName,
      },
    });

    this.toggleEditMode();

    return this.setState({
      isSaving: false,
    });
  };

  render() {
    const { source } = this.props;
    const {
      sourceName,
      isEditMode,
      showMenu,
      showControlPanel,
      isSaving,
    } = this.state;

    return (
      <Wrapper
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <Header>
          {isEditMode ? (
            <input
              type="text"
              value={sourceName}
              disabled={isSaving}
              onChange={this.handleInputChange}
            />
          ) : (
            sourceName
          )}
          {isEditMode && (
            <>
              <TextButton
                type="button"
                disabled={isSaving}
                onClick={this.handleSaveSourceName}
              >
                Save
              </TextButton>
              <TextButton
                type="button"
                disabled={isSaving}
                onClick={this.toggleEditMode}
              >
                Cancel
              </TextButton>
            </>
          )}

          {showMenu && !isEditMode && (
            <>
              <TextButton type="button" onClick={this.toggleEditMode}>
                Edit
              </TextButton>
              <TextButton type="button" onClick={this.toggleControlPanel}>
                {showControlPanel ? 'Hide Control Panel' : 'Manage'}
              </TextButton>
            </>
          )}
        </Header>
        <div>
          <IdText>{source.id}</IdText>
        </div>

        {showControlPanel && (
          <Query query={SOURCE_QUERY} variables={{ id: source.id }}>
            {({ loading, error, data }) => {
              if (loading) return 'Fetching Source info...';

              if (error) return `Error: ${error.graphQLErrors}`;

              const sourceData = data.Source[0];

              const { tree } = sourceData;

              if (!tree) {
                return 'Error retrieving tree.';
              }

              if (
                (!tree.nodes ||
                  !Array.isArray(tree.nodes) ||
                  tree.nodes.length < 1) &&
                (!tree.root || !tree.root.id)
              ) {
                return <CreateFirstType treeId={tree.id} />;
              }

              return (
                <div>
                  <Row>
                    <SourceTypeTree source={sourceData} />
                  </Row>
                  <SourceControlPanel source={sourceData} ContentRow={Row} />
                </div>
              );
            }}
          </Query>
        )}
      </Wrapper>
    );
  }
}

Source.propTypes = {
  source: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
  }).isRequired,
  updateSourceName: PropTypes.func.isRequired,
};

export default graphql(UPDATE_SOURCE_NAME_MUTATION, {
  name: 'updateSourceName',
})(Source);
