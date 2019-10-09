import React, { Component } from 'react';
import { Formik } from 'formik';
import { graphql } from '@apollo/react-hoc';
import { MutationFunction } from '@apollo/react-common';
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

export interface Action {
  id: string;
  name: string;
  actionType: string;
}

export interface UserClassFragment {
  id: string;
  name: string;
  actions: Action[];
}

export interface UserActionViewProps {
  userClassId: string;
  createAction: MutationFunction;
  returnToIndex: () => void;
}

export interface UserActionViewState {
  errors: string[];
}

class UserActionView extends Component<
  UserActionViewProps,
  UserActionViewState
> {
  public readonly state = {
    errors: [],
  };

  public handleSubmit = async (
    values: { actionName: string; type: string; params: string },
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void },
  ): Promise<void> => {
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
        update: (cache, { data: { newAction } }): void => {
          const fragmentName = 'UserClassParts';
          const fragmentId = `${userClassId}UserClass`;

          const userClass = cache.readFragment({
            id: fragmentId,
            fragment: USER_CLASS_FRAGMENT,
            fragmentName,
          }) as UserClassFragment;

          userClass.actions = userClass.actions.concat(newAction);

          cache.writeFragment({
            id: fragmentId,
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

  public render(): JSX.Element {
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
          render={(props: { isSubmitting: boolean }): JSX.Element => (
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

export interface Response {
  newAction: Action;
}

export interface Variables {
  name: string;
  userClassId: string;
  actionType: string;
  actionParameters: string;
}

export default graphql<{}, Response, Variables, UserActionViewProps>(
  CREATE_ACTION_MUTATION,
  { name: 'createAction' },
)(UserActionView);
