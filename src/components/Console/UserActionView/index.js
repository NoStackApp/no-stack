import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Formik } from 'formik';
import { graphql } from '@apollo/react-hoc';
import gql from 'graphql-tag';
import styled from 'styled-components';

import NewActionForm from './NewActionForm';
import { ACTION_FRAGMENT, USER_CLASS_FRAGMENT } from '../fragments';

const CREATE_ACTION_MUTATION = gql`
  mutation CREATE_ACTION(
    $name: String!
    $userClassId: ID!
    $actionType: ActionType!
    $actionParameters: String
  ) {
    newAction: CreateAction(
      name: $name
      userClassId: $userClassId
      actionType: $actionType
      actionParameters: $actionParameters
    ) {
      ...ActionParts
    }
  }

  ${ACTION_FRAGMENT}
`;

const Wrapper = styled.div``;

class UserActionView extends Component {
  state = {
    errors: [],
  };

  handleSubmit = async (values, { setSubmitting }) => {
    const { userClassId, createAction, returnToIndex } = this.props;
    const { actionName, type, params } = values;

    this.setState({ errors: [] });

    const errors = [];

    try {
      const { data } = await createAction({
        variables: {
          name: actionName,
          userClassId,
          actionType: type,
          actionParameters: JSON.stringify(JSON.parse(params)),
        },
        update: (cache, { data: { newAction } }) => {
          const fragmentName = 'UserClassParts';

          const userClass = cache.readFragment({
            id: userClassId,
            fragment: USER_CLASS_FRAGMENT,
            fragmentName,
          });

          userClass.actions = userClass.actions.concat(newAction);

          cache.writeFragment({
            id: userClassId,
            fragment: USER_CLASS_FRAGMENT,
            fragmentName,
            data: {
              ...userClass,
            },
          });
        },
      });

      if (!data.newAction) {
        throw new Error('Failed to create action.');
      }
    } catch (error) {
      if (error.graphQLErrors && error.graphQLErrors.length) {
        errors.push(error.graphQLErrors);
      }

      if (
        error.networkError &&
        error.networkError.result &&
        error.networkError.result.errors &&
        error.networkError.result.errors.length
      ) {
        errors.push(error.networkError.result.errors);
      }

      if (error.message) {
        errors.push(error.message);
      }
    }

    setSubmitting(false);

    if (errors.length) {
      this.setState({
        errors,
      });

      return;
    }

    returnToIndex();
  };

  render() {
    const { returnToIndex } = this.props;
    const { errors } = this.state;

    return (
      <Wrapper>
        <Formik
          initialValues={{
            actionName: '',
            type: '',
            params: '',
          }}
          onSubmit={this.handleSubmit}
          render={props => (
            <NewActionForm
              {...props}
              errors={errors}
              onCancel={returnToIndex}
            />
          )}
        />
      </Wrapper>
    );
  }
}

UserActionView.propTypes = {
  returnToIndex: PropTypes.func.isRequired,
  userClassId: PropTypes.string.isRequired,
  createAction: PropTypes.func.isRequired,
};

export default graphql(CREATE_ACTION_MUTATION, { name: 'createAction' })(
  UserActionView,
);
