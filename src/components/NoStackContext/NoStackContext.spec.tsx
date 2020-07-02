import React from 'react';
import { render, wait, fireEvent } from '@testing-library/react';
import { createMockClient } from 'mock-apollo-client';
import faker from 'faker';

import { EXECUTE } from 'mutations';

import { NoStackProvider, NoStackConsumer, withNoStack } from '.';

faker.seed(123);

type storeKeys = 'accessToken' | 'refreshToken';

const actionId = 'a0d89c1f-c423-45e0-9339-c719dcbb7afe';

describe('<NoStackConsumer />', () => {
  let store: {
    accessToken?: string | null;
    refreshToken?: string | null;
  };

  const mockClient = createMockClient();
  const mockPlatformId = faker.random.uuid();

  const AccessToken = faker.internet.password();
  const mockUser = {
    id: faker.random.uuid(),
    userId: faker.random.uuid(),
    userName: faker.internet.userName(),
    role: faker.random.word(),
    accessToken: AccessToken,
    AuthenticationResult: {
      AccessToken,
      RefreshToken: faker.internet.password(),
    },
  };

  const queryHandler = jest.fn().mockResolvedValue({
    data: {
      Execute: JSON.stringify({
        ...mockUser,
      }),
    },
  });

  mockClient.setRequestHandler(EXECUTE, queryHandler);

  beforeEach(() => {
    store = {};

    jest
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation((key: storeKeys): string | null => store[key]);

    jest
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation((key: storeKeys, value: string): void => {
        store[key] = value.toString();
      });

    jest.spyOn(Storage.prototype, 'clear').mockImplementation((): void => {
      store = {};
    });

    queryHandler.mockClear();
  });

  it('should return platform and user info when logged in', async () => {
    localStorage.setItem('accessToken', AccessToken);

    const { container, getByText } = render(
      <NoStackProvider client={mockClient} platformId={mockPlatformId}>
        <NoStackConsumer>
          {({ platformId, currentUser, loading }): JSX.Element | null => {
            if (loading) {
              return null;
            }

            return (
              <>
                <div>{platformId}</div>
                <div>{currentUser.id}</div>
                <div>{currentUser.username}</div>
                <div>{currentUser.role}</div>
                <div>{currentUser.accessToken}</div>
              </>
            );
          }}
        </NoStackConsumer>
      </NoStackProvider>,
    );

    expect(container.firstChild).toBeNull();

    await wait(() => {
      expect(getByText(mockPlatformId)).toBeTruthy();
      expect(getByText(mockUser.userId)).toBeTruthy();
      expect(getByText(mockUser.userName)).toBeTruthy();
      expect(getByText(mockUser.role)).toBeTruthy();
      expect(getByText(mockUser.accessToken)).toBeTruthy();
    });
  });

  it('should provide a login & logout callback functions', async () => {
    const mockUserName = faker.internet.userName();
    const mockPassword = faker.internet.password();

    jest.spyOn(mockClient, 'resetStore');

    const { container, getByText } = render(
      <NoStackProvider client={mockClient} platformId={mockPlatformId}>
        <NoStackConsumer>
          {({ loading, login, logout }): JSX.Element | null => {
            if (loading) {
              return null;
            }

            return (
              <>
                <button
                  type="button"
                  onClick={() =>
                    login({
                      username: mockUserName,
                      password: mockPassword,
                    })
                  }
                >
                  Login
                </button>
                <button type="button" onClick={() => logout()}>
                  Logout
                </button>
              </>
            );
          }}
        </NoStackConsumer>
      </NoStackProvider>,
    );

    expect(container.firstChild).toBeNull();

    expect(localStorage.getItem('accessToken')).toBeUndefined();

    await wait(() => {
      const loginButton = getByText(/login/i);

      fireEvent.click(loginButton);
    });

    expect(localStorage.getItem('accessToken')).toBe(AccessToken);
    expect(queryHandler).toHaveBeenCalledTimes(1);
    expect(queryHandler).toHaveBeenCalledWith({
      actionId,
      executionParameters: JSON.stringify({
        userName: mockUserName,
        password: mockPassword,
        platformId: mockPlatformId,
      }),
      unrestricted: true,
    });

    mockClient.resetStore.mockClear();

    await wait(() => {
      const logoutButton = getByText(/logout/i);

      fireEvent.click(logoutButton);
    });

    expect(localStorage.getItem('accessToken')).toBeUndefined();

    expect(mockClient.resetStore).toHaveBeenCalledTimes(1);
  });
});

describe('withNoStack() HOC', () => {
  let store: {
    accessToken?: string | null;
    refreshToken?: string | null;
  };

  const mockClient = createMockClient();
  const mockPlatformId = faker.random.uuid();

  const AccessToken = faker.internet.password();
  const mockUser = {
    id: faker.random.uuid(),
    userId: faker.random.uuid(),
    userName: faker.internet.userName(),
    role: faker.random.word(),
    accessToken: AccessToken,
    AuthenticationResult: {
      AccessToken,
      RefreshToken: faker.internet.password(),
    },
  };

  const queryHandler = jest.fn().mockResolvedValue({
    data: {
      Execute: JSON.stringify({
        ...mockUser,
      }),
    },
  });

  mockClient.setRequestHandler(EXECUTE, queryHandler);

  beforeEach(() => {
    store = {};

    jest
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation((key: storeKeys): string | null => store[key]);

    jest
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation((key: storeKeys, value: string): void => {
        store[key] = value.toString();
      });

    jest.spyOn(Storage.prototype, 'clear').mockImplementation((): void => {
      store = {};
    });

    queryHandler.mockClear();
  });

  it('should return platform and user info when logged in', async () => {
    localStorage.setItem('accessToken', AccessToken);

    const TestComponent = withNoStack(
      ({ platformId, currentUser, loading }) => {
        if (loading) {
          return null;
        }

        return (
          <>
            <div>{platformId}</div>
            <div>{currentUser.id}</div>
            <div>{currentUser.username}</div>
            <div>{currentUser.role}</div>
            <div>{currentUser.accessToken}</div>
          </>
        );
      },
    );

    const { container, getByText } = render(
      <NoStackProvider client={mockClient} platformId={mockPlatformId}>
        <TestComponent />
      </NoStackProvider>,
    );

    expect(container.firstChild).toBeNull();

    await wait(() => {
      expect(getByText(mockPlatformId)).toBeTruthy();
      expect(getByText(mockUser.userId)).toBeTruthy();
      expect(getByText(mockUser.userName)).toBeTruthy();
      expect(getByText(mockUser.role)).toBeTruthy();
      expect(getByText(mockUser.accessToken)).toBeTruthy();
    });
  });

  it('should provide a login & logout callback functions', async () => {
    const mockUserName = faker.internet.userName();
    const mockPassword = faker.internet.password();

    jest.spyOn(mockClient, 'resetStore');

    const TestComponent = withNoStack(({ loading, login, logout }) => {
      if (loading) {
        return null;
      }

      return (
        <>
          <button
            type="button"
            onClick={() =>
              login({
                username: mockUserName,
                password: mockPassword,
              })
            }
          >
            Login
          </button>
          <button type="button" onClick={() => logout()}>
            Logout
          </button>
        </>
      );
    });

    const { container, getByText } = render(
      <NoStackProvider client={mockClient} platformId={mockPlatformId}>
        <TestComponent />
      </NoStackProvider>,
    );

    expect(container.firstChild).toBeNull();

    expect(localStorage.getItem('accessToken')).toBeUndefined();

    await wait(() => {
      const loginButton = getByText(/login/i);

      fireEvent.click(loginButton);
    });

    expect(localStorage.getItem('accessToken')).toBe(AccessToken);
    expect(queryHandler).toHaveBeenCalledTimes(1);
    expect(queryHandler).toHaveBeenCalledWith({
      actionId,
      executionParameters: JSON.stringify({
        userName: mockUserName,
        password: mockPassword,
        platformId: mockPlatformId,
      }),
      unrestricted: true,
    });

    mockClient.resetStore.mockClear();

    await wait(() => {
      const logoutButton = getByText(/logout/i);

      fireEvent.click(logoutButton);
    });

    expect(localStorage.getItem('accessToken')).toBeUndefined();

    expect(mockClient.resetStore).toHaveBeenCalledTimes(1);
  });
});
