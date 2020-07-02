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

export interface User {
  id: string;
  username: string;
  role: string;
  accessToken: string;
}

export interface ContextInterface {
  platformId: string | null;
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
  platformId: null,
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
  platformId: string | null;
  loginUser: (options: object) => Promise<any>;
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
    const { loginUser, platformId } = this.props;

    const executionParameters = JSON.stringify({
      userName: username,
      password,
      platformId,
    });

    const res = await loginUser({
      variables: {
        // LOGIN ACTION
        actionId: 'a0d89c1f-c423-45e0-9339-c719dcbb7afe',
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

      console.log(`error logging ins: ${JSON.stringify(res.error, null, 2)}`);

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
      user = await this.retrieveUserWithRefreshedToken();
    }

    return user;
  }

  private async retrieveUserWithRefreshedToken(): Promise<User | void> {
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
    const { loginUser: refreshAccessToken, platformId } = this.props;

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return this.logout();
    }

    const executionParameters = JSON.stringify({ refreshToken, platformId });

    const res = await refreshAccessToken({
      variables: {
        // REFRESH TOKEN ACTION
        actionId: '96d3be63-53c5-418e-9167-71e3d43271e3',
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

  public async loginWithToken(): Promise<User | void> {
    const { loginUser, platformId } = this.props;

    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      return this.logout();
    }

    const executionParameters = JSON.stringify({ accessToken, platformId });

    const res = await loginUser({
      variables: {
        // VERIFY TOKEN/RETRIEVE USER ACTION
        actionId: '1279e113-d70f-4a95-9890-a5cebd344f3d',
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
    const { platformId, children, client } = this.props;

    const providerProps = {
      platformId,
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
          platformId={platformId}
          loginUser={loginUser}
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
