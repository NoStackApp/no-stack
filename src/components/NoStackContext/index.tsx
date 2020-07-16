import React, {
  Component,
  createContext,
  ComponentType,
  FunctionComponent,
} from 'react';
// import { graphql } from '@apollo/react-hoc';
import { Mutation } from '@apollo/react-components';
import { ApolloProvider, MutationFunction } from '@apollo/react-common';
import { ApolloClient, ApolloError } from 'apollo-client';
import { NormalizedCache } from 'apollo-cache-inmemory';

import { EXECUTE } from '../../mutations';
import {
  LOGIN_ACTION_ID,
  REFRESH_TOKEN_ACTION_ID,
  VERIFY_TOKEN_ACTION_ID,
} from '../../config';

export interface User {
  id: string;
  username: string;
  role: string;
  accessToken: string;
}

export interface ContextInterface {
  stackId: string | null;
  currentUser: User | null;
  client?: ApolloClient<NormalizedCache>;
  loading: boolean;
  login({
    username,
    password,
  }: {
    username: string;
    password: string;
  }): Promise<unknown> | void;
  logout(): void;
}

const { Provider, Consumer } = createContext<ContextInterface>({
  stackId: null,
  currentUser: null,
  client: undefined,
  loading: true,
  login: (): void => {},
  logout: (): void => {},
});

export const NoStackConsumer: FunctionComponent<{
  children: (context: ContextInterface) => React.ReactNode;
}> = ({ children }): JSX.Element => (
  <Consumer>
    {(context): React.ReactNode => {
      if (context === undefined) {
        throw new Error(
          'NoStackConsumer must be used within a NoStackProvider.',
        );
      }

      return children(context);
    }}
  </Consumer>
);

export interface ProviderProps {
  client: ApolloClient<NormalizedCache>;
  stackId: string | null;
  updateAuth: (options: object) => Promise<any>;
}

export interface ProviderState {
  currentUser: User | null;
  loading: boolean;
}

class RawNoStackProvider extends Component<ProviderProps, ProviderState> {
  public readonly state = {
    currentUser: null,
    loading: true,
  };

  public async componentDidMount(): Promise<void> {
    const user = await this.retrieveUserWithToken();

    if (user) {
      this.setUser(user.id, user.username, user.role, user.accessToken);
    } else {
      this.logout();
    }

    this.setState({
      loading: false,
    });
  }

  public setUser = (
    id: string,
    username: string,
    role: string,
    accessToken: string,
  ): void =>
    this.setState({
      currentUser: {
        id,
        username,
        role,
        accessToken,
      },
    });

  public logout = (cb?: () => void): void => {
    const { client } = this.props;
    console.log(`about to logout.`);

    localStorage.clear();

    client.resetStore();

    this.setState({ currentUser: null }, cb);
  };

  public login = async ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }): Promise<unknown> => {
    const { updateAuth, stackId } = this.props;

    const executionParameters = JSON.stringify({
      userName: username,
      password,
      platformId: stackId,
    });

    console.log(`in login with new version ... stackId = ${stackId}; 
    executionParameters = ${JSON.stringify(executionParameters, null, 2)}`);
    const res = await updateAuth({
      variables: {
        // LOGIN ACTION
        actionId: LOGIN_ACTION_ID,
        executionParameters,
        unrestricted: true,
      },
    }).catch((err: ApolloError): {
      error: ApolloError;
      data?: Response;
    } => {
      return { error: err };
    });

    if (res.error || !res.data || !res.data.Execute) {
      if (res.error.networkError) {
        throw res.error.networkError;
      }

      if (res.error.graphQLErrors) {
        throw res.error.graphQLErrors[0];
      }

      console.log(`error logging in: ${JSON.stringify(res.error, null, 2)}`);

      throw new Error('Unknown error logging in.');
    }

    const response = JSON.parse(res.data.Execute);

    if (
      !response.userId ||
      !response.userName ||
      !response.role ||
      !response.AuthenticationResult ||
      !response.AuthenticationResult.AccessToken ||
      !response.AuthenticationResult.RefreshToken
    ) {
      throw new Error('Missing data from server on login.');
    }

    this.setUser(
      response.userId,
      response.userName,
      response.role,
      response.AuthenticationResult.AccessToken,
    );

    await localStorage.setItem(
      'accessToken',
      response.AuthenticationResult.AccessToken,
    );
    await localStorage.setItem(
      'refreshToken',
      response.AuthenticationResult.RefreshToken,
    );

    return response;
  };

  private async retrieveUserWithToken(): Promise<User | void> {
    let user;

    try {
      user = await this.loginWithToken();
    } catch (e) {
      user = await this.retrieveUserWithRefreshToken();
    }

    return user;
  }

  private async retrieveUserWithRefreshToken(): Promise<User | void> {
    let user;

    try {
      await this.refreshToken();

      user = await this.loginWithToken();
    } catch (e) {
      console.log('Invalid token.');
    }

    return user;
  }

  public async refreshToken(): Promise<string | void> {
    const { updateAuth, stackId } = this.props;

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return this.logout();
    }

    const executionParameters = JSON.stringify({
      refreshToken,
      platformId: stackId,
    });

    console.log(`in refreshToken...; 
    executionParameters = ${JSON.stringify(executionParameters, null, 2)}`);

    const res = await updateAuth({
      variables: {
        // REFRESH TOKEN ACTION
        actionId: REFRESH_TOKEN_ACTION_ID,
        executionParameters,
        unrestricted: true,
      },
    }).catch((err: ApolloError): {
      error: ApolloError;
      data?: Response;
    } => {
      return { error: err };
    });

    console.log(`in refreshToken...; 
    res = ${JSON.stringify(res, null, 2)}`);

    if (res.error || !res.data || !res.data.Execute) {
      return this.logout();
    }

    const response = JSON.parse(res.data.Execute);

    if (
      !response.AuthenticationResult ||
      !response.AuthenticationResult.AccessToken
    ) {
      return this.logout();
    }

    await localStorage.setItem(
      'accessToken',
      response.AuthenticationResult.AccessToken,
    );

    return response.AuthenticationResult.AccessToken;
  }

  /*
  The sequence of auth control when opening a unit seems to be:
    1. get the accessToken from local storage.
    2. if there is none, logout.
    3. otherwise, call verifyToken.
    4. if good, set user data and we're done
    5. if not, call refreshToken
    6. if works, set data and we're done.
    7. if not, logout, and user must log in again.
   */
  public async loginWithToken(): Promise<User | void> {
    const { updateAuth, stackId } = this.props;

    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      return this.logout();
    }

    const executionParameters = JSON.stringify({
      accessToken,
      platformId: stackId,
    });

    const res = await updateAuth({
      variables: {
        // VERIFY TOKEN/RETRIEVE USER ACTION
        actionId: VERIFY_TOKEN_ACTION_ID,
        executionParameters,
        unrestricted: true,
      },
    }).catch((err: ApolloError): {
      error: ApolloError;
      data?: Response;
    } => {
      return { error: err };
    });

    if (res.error || !res.data || !res.data.Execute) {
      throw new Error('Expired/Invalid Token');
    }

    const response = JSON.parse(res.data.Execute);

    if (!response.userId || !response.role || !response.accessToken) {
      throw new Error('Expired/Invalid Token');
    }

    return {
      id: response.userId,
      role: response.role,
      username: response.userName,
      accessToken: response.accessToken,
    };
  }

  public render(): JSX.Element {
    const { currentUser, loading } = this.state;
    const { stackId, children, client } = this.props;

    const providerProps = {
      stackId,
      currentUser,
      client,
      loading,
      login: this.login,
      logout: this.logout,
    };

    return <Provider value={providerProps}>{children}</Provider>;
  }
}

export interface Response {
  Execute: string;
}

export interface Variables {
  actionId: string;
  executionParameters?: string;
  unrestricted: boolean;
}

export const NoStackProvider: FunctionComponent<{
  client: ApolloClient<NormalizedCache>;
  platformId: string;
  children: React.ReactNode;
}> = ({ client, platformId, children }): JSX.Element => (
  <ApolloProvider client={client}>
    <Mutation mutation={EXECUTE}>
      {(loginUser: MutationFunction): JSX.Element => (
        <RawNoStackProvider
          client={client}
          stackId={platformId}
          updateAuth={loginUser}
        >
          {children}
        </RawNoStackProvider>
      )}
    </Mutation>
  </ApolloProvider>
);

export function withNoStack<Props>(
  WrappedComponent: ComponentType<Props & Partial<ContextInterface>>,
): FunctionComponent<Props> {
  return function HOC(props: Props): JSX.Element {
    return (
      <NoStackConsumer>
        {(noStackProps: Partial<ContextInterface>): JSX.Element => (
          <WrappedComponent {...noStackProps} {...props} />
        )}
      </NoStackConsumer>
    );
  };
}
