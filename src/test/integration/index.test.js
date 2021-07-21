import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { createMockClient } from 'mock-apollo-client';
import { Error } from '@apollo/react-components';
import {
  EXECUTE,
  FORGOT_PASSWORD,
  LOGIN,
  REFRESH_TOKEN,
  REGISTER_USER,
  RESEND_CONFIRMATION,
  RESET_PASSWORD,
  VERIFY_TOKEN,
} from 'mutations';
import { GraphQLError } from 'graphql';
import { mockedResponse } from './data/mocked-response';

import {
  failedLogin,
  successLogin,
  validStackId,
  userNameOrEmail,
} from './data/mocked-inputs';

global.fetch = require('node-fetch');

let mockClient;

let client;
let accessToken;
jest.setTimeout(10000);

const loginFunction = async () => {
  const result = await client.mutate({
    mutation: LOGIN,
    variables: successLogin,
  });

  const {
    data: { login },
  } = result;

  return JSON.parse(login);
};

const getAccessToken = async () => {
  const {
    AuthenticationResult: { AccessToken },
  } = await loginFunction();

  return AccessToken;
};

function getFailureHandler(data) {
  return function() {
    return Promise.resolve({ errors: [new Error('Fake Error')] });
  };
}
function setClient(mutationName, keyName, mutationString, inputHandler) {
  // mockedResponse
  // mockClient.setRequestHandler(EXECUTE, queryHandler);
  const runWithMock = true;
  if (runWithMock) {
    const data = mockedResponse[mutationName][keyName];
    const handler = inputHandler
      ? inputHandler(data)
      : jest.fn().mockResolvedValue(data);

    client = createMockClient();

    client.setRequestHandler(mutationString, handler);
  } else {
    client = new ApolloClient({
      uri: 'https://api.nostack.net/graphql',
      cache: new InMemoryCache(),
    });
  }
}

describe('GIVEN mutations', () => {
  // beforeAll(() => {
  //   client = new ApolloClient({
  //     uri: 'https://api.nostack.net/graphql',
  //     cache: new InMemoryCache(),
  //   });
  // });

  describe('GIVEN LOGIN mutation', () => {
    describe('AND GIVEN correct inputs', () => {
      beforeEach(() => {
        setClient('LOGIN', 'success', LOGIN);
      });

      it('SHOULD return success response', async () => {
        const result = await client.mutate({
          mutation: LOGIN,
          variables: successLogin,
        });

        const {
          data: { login },
        } = result;

        expect(login.includes('AccessToken')).toBeTruthy();
      });
    });

    describe('AND GIVEN in-correct inputs', () => {
      beforeEach(() => {
        setClient('LOGIN', 'failure', LOGIN, getFailureHandler({}));
      });

      it('SHOULD return error with error code', async () => {
        try {
          const result = await client.mutate({
            mutation: LOGIN,
            variables: failedLogin,
          });
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });
    });
  });

  describe('Given REFRESH_TOKEN mutation', () => {
    describe('AND Given valid token', () => {
      beforeEach(async () => {
        const result = await client.mutate({
          mutation: LOGIN,
          variables: successLogin,
        });
        const {
          data: { login },
        } = result;

        const userData = JSON.parse(login);

        const {
          AuthenticationResult: { AcessToken },
        } = userData;
        accessToken = userData.AuthenticationResult.AccessToken;
      });

      it('SHOULD throw error', async () => {
        try {
          console.log({ validStackId });
          const result = await client.mutate({
            mutation: REFRESH_TOKEN,
            variables: {
              token: accessToken,
              stackId: validStackId,
            },
          });
        } catch (error) {
          console.log({ error });
          expect(error).toBeInstanceOf(Error);
        }
      });
    });
  });

  describe('GIVEN REGISTER mutation', () => {
    describe('AND GIVEN correct inputs', () => {
      it('SHOULD return success response', async () => {
        const result = await client.mutate({
          mutation: REGISTER_USER,
          variables: {
            userNameOrEmail: 'Me',
            password: 'OpenUp1!',
            stackId: 'us-east-1_kYI8RNIb1',
          },
        });
        const {
          data: { login },
        } = result;

        expect(login.includes('AccessToken')).toBeTruthy();
      });
    });

    describe('AND GIVEN in-correct inputs', () => {
      it('SHOULD return error with error code', async () => {
        try {
          const result = await client.mutate({
            mutation: LOGIN,
            variables: {
              userNameOrEmail: 'You',
              password: 'penUp1!',
              stackId: 'us-east-1_kYI8RNIb1',
            },
          });
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });
    });
  });

  describe('GIVEN VERIFY_TOKEN mutation', () => {
    describe('AND Given a valid token', () => {
      it('SHOULD return valid response', async () => {
        /*
          AccessToken
          RefreshToken
          IdToken
        */
        const { AuthenticationResult } = await loginFunction();

        console.log({ testing: AuthenticationResult });
        const result = await client.mutate({
          mutation: VERIFY_TOKEN,
          variables: {
            token: AccessToken,
            stackId: validStackId,
          },
        });
      });
    });

    describe('AND Given an invalid token', () => {
      try {
        it('SHOULD return valid response', async () => {
          const result = await client.mutate({
            mutation: VERIFY_TOKEN,
            variables: {
              token: 'AccessToken',
              stackId: validStackId,
            },
          });
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('GIVEN FORGOT_PASSWORD mutation', () => {
    describe('AND Given valid input', () => {
      beforeEach(() => {
        const data = mockedResponse.FORGOT_PASSWORD.success;
        client = mockApolloClient(FORGOT_PASSWORD, data);
      });

      it('SHOULD return valid response', async () => {
        const { userNameOrEmail, stackId } = successLogin;

        const result = await client.mutate({
          mutation: FORGOT_PASSWORD,
          variables: {
            userNameOrEmail,
            stackId,
          },
        });

        expect(result.data.forgotPassword).toHaveProperty(
          'CodeDeliveryDetials',
        );
      });
    });

    describe('AND Given invalid input', () => {
      it('SHOULD return an exception', async () => {
        const { stackId } = successLogin;

        try {
          const result = await client.mutate({
            mutation: FORGOT_PASSWORD,
            variables: {
              userNameOrEmail: 'somerandom',
              stackId,
            },
          });
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });
    });
  });

  describe('GIVEN RESET_PASSWORD mutation', () => {
    describe('AND Given valid input', () => {
      it('SHOULD return valid response', async () => {
        const { userNameOrEmail, stackId } = successLogin;
        const password = 'Test@123$';
        const code = '1234';

        const result = await client.mutate({
          mutation: RESET_PASSWORD,
          variables: {
            userNameOrEmail,
            password,
            code,
            stackId,
          },
        });

        expect(result.data.forgotPassword).toHaveProperty(
          'CodeDeliveryDetials',
        );
      });
    });

    describe('AND Given invalid input', () => {
      it('SHOULD return error', async () => {
        try {
          const { userNameOrEmail, stackId } = successLogin;
          const password = 'Test@123$';
          const code = '1234';

          const result = await client.mutate({
            mutation: RESET_PASSWORD,
            variables: {
              userNameOrEmail,
              password,
              code,
              stackId,
            },
          });
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });
    });
  });

  describe('GIVEN RESEND_CONFIRMATION mutation', () => {
    describe('AND Given valid input', () => {
      it('SHOULD return valid response', async () => {
        const { userNameOrEmail, stackId } = successLogin;

        const result = await client.mutate({
          mutation: RESEND_CONFIRMATION,
          variables: {
            userNameOrEmail,
            stackId,
          },
        });

        expect(result.data.forgotPassword).toHaveProperty(
          'CodeDeliveryDetials',
        );
      });
    });

    describe('AND Given invalid input', () => {
      it('SHOULD throw error', async () => {
        try {
          const { userNameOrEmail, stackId } = successLogin;

          const result = await client.mutate({
            mutation: RESEND_CONFIRMATION,
            variables: {
              userNameOrEmail: 'testing',
              stackId,
            },
          });
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });
    });
  });

  describe('GIVEN EXECUTE mutation', () => {
    describe('AND Given valid input', () => {
      it('SHOULD return valid response', async () => {
        const { userNameOrEmail, stackId } = successLogin;

        const result = await client.mutate({
          mutation: EXECUTE,
          variables: {
            userNameOrEmail,
            stackId,
          },
        });

        expect(result.data.forgotPassword).toHaveProperty(
          'CodeDeliveryDetials',
        );
      });
    });

    describe('AND Given invalid input', () => {
      it('SHOULD throw error', async () => {
        try {
          const { userNameOrEmail, stackId } = successLogin;

          const result = await client.mutate({
            mutation: EXECUTE,
            variables: {
              userNameOrEmail: 'testing',
              stackId,
            },
          });
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });
    });
  });
});
