import React, { Component, FormEvent, ChangeEvent } from 'react';
import styled from 'styled-components';

import { withNoStack } from '../NoStackContext';

const Wrapper = styled.div`
  width: 250px;

  padding: 1em 0;

  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px 10px 10px 10px;
  box-shadow: 10px 10px 8px -1px rgba(0, 0, 0, 0.6);
`;

const Row = styled.div`
  margin: 0.5em;
  padding: 0.5em;
  text-align: center;

  input {
    display: block;
    margin: 0.5em auto;
    width: 80%;
  }
`;

interface FormProps {
  loading: boolean;
  currentUser?: any;
  login: (args: { username: string; password: string }) => Promise<any>;
  submitButtonText?: string;
}

interface FormState {
  username: string;
  password: string;
  isSubmitting: boolean;
  error: string;
}

export class RawLoginForm extends Component<FormProps, FormState> {
  public static defaultProps = {
    currentUser: null,
    submitButtonText: 'Log In',
  };

  public readonly state = {
    username: '',
    password: '',
    isSubmitting: false,
    error: '',
  };

  public handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    e.preventDefault();

    this.setState(({
      [e.currentTarget.name]: e.currentTarget.value,
    } as unknown) as FormState);
  };

  public handleSubmit = async (
    e: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    const { username, password } = this.state;
    const { login } = this.props;

    e.preventDefault();

    this.setState({
      isSubmitting: true,
    });

    try {
      await login({
        username,
        password,
      });
    } catch (error) {
      this.setState({
        isSubmitting: false,
        error:
          error.message ||
          (error.graphQLErrors &&
            error.graphQLErrors.length &&
            error.graphQLErrors[0]) ||
          error,
      });
    }
  };

  public render(): JSX.Element | null {
    const { loading, currentUser, submitButtonText } = this.props;
    const { username, password, isSubmitting, error } = this.state;

    if (loading || currentUser) {
      return null;
    }

    return (
      <Wrapper>
        <form onSubmit={this.handleSubmit}>
          <Row>
            <label htmlFor="nostack-username">
              Username:
              <input
                id="nostack-username"
                type="text"
                name="username"
                disabled={isSubmitting}
                value={username}
                onChange={this.handleInputChange}
              />
            </label>
          </Row>
          <Row>
            <label htmlFor="nostack-password">
              Password:
              <input
                id="nostack-password"
                type="password"
                name="password"
                disabled={isSubmitting}
                value={password}
                onChange={this.handleInputChange}
              />
            </label>
          </Row>
          <Row>
            <button
              type="submit"
              disabled={isSubmitting || !username || !password}
            >
              {submitButtonText}
            </button>
          </Row>
          {error && <Row>{error}</Row>}
        </form>
      </Wrapper>
    );
  }
}

export const LoginForm = withNoStack(RawLoginForm);
