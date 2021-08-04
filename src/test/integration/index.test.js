import { ApolloClient, InMemoryCache } from '@apollo/client';
import { createMockClient } from 'mock-apollo-client';
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
import { mockedResponse } from './data/mocked-response';

import {
  failedLogin,
  successLogin,
  validStackId,
  successCreateUser,
  executeParams,
} from './data/mocked-inputs';

require('dotenv').config();

global.fetch = require('node-fetch');

let client;
let mockedHandler;
jest.setTimeout(10000);
const runWithMock = process.env.RUN_MOCK;

const loginFunction = async () => {
  if (runWithMock) {
    return JSON.parse(mockedResponse.LOGIN.success.data.login);
  }
  const result = await client.mutate({
    mutation: LOGIN,
    variables: successLogin,
  });

  const {
    data: { login },
  } = result;

  return JSON.parse(login);
};

function setClient(mutationName, keyName, mutationString, inputHandler) {
  if (runWithMock) {
    const data = mockedResponse[mutationName][keyName];
    const handler = inputHandler || jest.fn().mockResolvedValue(data);

    client = createMockClient();

    client.setRequestHandler(mutationString, handler);
  } else {
    mockedHandler = jest.fn();

    client = new ApolloClient({
      uri: 'https://api.nostack.net/graphql',
      cache: new InMemoryCache(),
    });

    mockedHandler();
  }
}

const getErrorHandler = message => {
  mockedHandler = jest.fn(() =>
    Promise.resolve({
      errors: [
        {
          message,
        },
      ],
    }),
  );

  return mockedHandler;
};

describe('GIVEN mutations', () => {
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
        setClient(
          'LOGIN',
          'failure',
          LOGIN,
          getErrorHandler(mockedResponse.LOGIN.error.message),
        );
      });
      it('SHOULD throw error with error message', async () => {
        await expect(
          client.mutate({
            mutation: LOGIN,
            variables: failedLogin,
          }),
        ).rejects.toThrow(mockedResponse.LOGIN.error.message);

        expect(mockedHandler).toHaveBeenCalled();
      });
    });
  });

  describe('Given REFRESH_TOKEN mutation', () => {
    describe('AND Given valid token', () => {
      beforeEach(() => {
        setClient('REFRESH_TOKEN', 'success', REFRESH_TOKEN);
      });
      it('SHOULD have refreshToken returned', async () => {
        // const { RefreshToken } = await loginFunction();
        const {
          AuthenticationResult: { RefreshToken },
        } = await loginFunction();
        const result = await client.mutate({
          mutation: REFRESH_TOKEN,
          variables: {
            token: RefreshToken,
            stackId: validStackId,
          },
        });
        expect(result.data.refreshToken.includes('AccessToken')).toBe(true);
      });
    });
    describe('AND Given invalid token', () => {
      beforeEach(() => {
        setClient('REFRESH_TOKEN', 'failure', REFRESH_TOKEN, () =>
          Promise.resolve({
            errors: [
              {
                message: mockedResponse.REFRESH_TOKEN.error.message,
              },
            ],
          }),
        );
      });
      it('SHOULD throw error', async () => {
        await expect(
          client.mutate({
            mutation: REFRESH_TOKEN,
            variables: {
              token: 'invalidaccessToken',
              stackId: validStackId,
            },
          }),
        ).rejects.toThrow(mockedResponse.REFRESH_TOKEN.error.message);

        expect(mockedHandler).toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN REGISTER mutation', () => {
    describe('AND GIVEN correct inputs', () => {
      beforeEach(() => {
        setClient('REGISTER_USER', 'success', REGISTER_USER);
      });
      it('SHOULD return success response', async () => {
        const result = await client.mutate({
          mutation: REGISTER_USER,
          variables: {
            ...successCreateUser,
          },
        });
        const {
          data: { user },
        } = result;
        // expect(user.name).toBe(successCreateUser.name);
        expect(user).toHaveProperty('id');
      });
    });
    describe('AND GIVEN in-correct inputs', () => {
      beforeEach(() => {
        setClient(
          'REGISTER_USER',
          'failure',
          REGISTER_USER,
          getErrorHandler(mockedResponse.REGISTER_USER.error.message),
        );
      });
      it('SHOULD return error with error message', async () => {
        await expect(
          client.mutate({
            mutation: REGISTER_USER,
            variables: {
              ...successCreateUser,
              name: '',
            },
          }),
        ).rejects.toThrow(mockedResponse.REGISTER_USER.error.message);
      });
    });
  });

  describe('GIVEN VERIFY_TOKEN mutation', () => {
    describe('AND Given a valid token', () => {
      beforeEach(() => {
        setClient('VERIFY_TOKEN', 'success', VERIFY_TOKEN);
      });
      it('SHOULD return valid response', async () => {
        /*
          AccessToken
          RefreshToken
          IdToken
        */
        const {
          AuthenticationResult: { AccessToken },
        } = await loginFunction();
        const result = await client.mutate({
          mutation: VERIFY_TOKEN,
          variables: {
            token: AccessToken,
            stackId: validStackId,
          },
        });
        expect(result.data).toHaveProperty('verifyToken');
      });
    });
    describe('AND Given an invalid token', () => {
      beforeEach(() => {
        setClient(
          'VERIFY_TOKEN',
          'success',
          VERIFY_TOKEN,
          getErrorHandler(mockedResponse.VERIFY_TOKEN.error.message),
        );
      });
      it('SHOULD return valid response', async () => {
        await expect(
          client.mutate({
            mutation: VERIFY_TOKEN,
            variables: {
              token: 'testing',
              stackId: validStackId,
            },
          }),
        ).rejects.toThrow(mockedResponse.VERIFY_TOKEN.error.message);

        expect(mockedHandler).toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN FORGOT_PASSWORD mutation', () => {
    describe('AND Given valid input', () => {
      beforeEach(() => {
        setClient('FORGOT_PASSWORD', 'success', FORGOT_PASSWORD);
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
        expect(result.data.forgotPassword.includes('CodeDeliveryDetails')).toBe(
          true,
        );
      });
    });
    describe('AND Given invalid input', () => {
      beforeEach(() => {
        setClient(
          'FORGOT_PASSWORD',
          'failure',
          FORGOT_PASSWORD,
          getErrorHandler(mockedResponse.FORGOT_PASSWORD.error.message),
        );
      });
      it('SHOULD return an exception', async () => {
        const { stackId } = successLogin;
        await expect(
          client.mutate({
            mutation: FORGOT_PASSWORD,
            variables: {
              userNameOrEmail: 'somerandom',
              stackId,
            },
          }),
        ).rejects.toThrow(mockedResponse.FORGOT_PASSWORD.error.message);

        expect(mockedHandler).toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN RESET_PASSWORD mutation', () => {
    describe('AND Given valid input', () => {
      beforeEach(() => {
        setClient('RESET_PASSWORD', 'success', RESET_PASSWORD);
      });
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
        expect(result.data).toHaveProperty('resetForgottenPassword');
      });
    });
    describe('AND Given invalid input', () => {
      beforeEach(() => {
        setClient(
          'RESET_PASSWORD',
          'failure',
          RESET_PASSWORD,
          getErrorHandler(mockedResponse.RESET_PASSWORD.error.message),
        );
      });
      it('SHOULD return error', async () => {
        const { userNameOrEmail, stackId } = successLogin;
        const password = 'Test@123$';
        const code = '1234';
        await expect(
          client.mutate({
            mutation: RESET_PASSWORD,
            variables: {
              userNameOrEmail,
              password,
              code,
              stackId,
            },
          }),
        ).rejects.toThrow(mockedResponse.RESET_PASSWORD.error.message);

        expect(mockedHandler).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('GIVEN RESEND_CONFIRMATION mutation', () => {
    describe('AND Given valid input', () => {
      beforeEach(() => {
        setClient('RESEND_CONFIRMATION', 'success', RESEND_CONFIRMATION);
      });
      it('SHOULD return valid response', async () => {
        const { userNameOrEmail, stackId } = successLogin;
        const result = await client.mutate({
          mutation: RESEND_CONFIRMATION,
          variables: {
            userNameOrEmail,
            stackId,
          },
        });
        expect(result.data.resendConfirmation.includes('Success')).toBe(true);
      });
    });
    describe('AND Given invalid input', () => {
      beforeEach(() => {
        setClient(
          'RESEND_CONFIRMATION',
          'failure',
          RESEND_CONFIRMATION,
          // getErrorHandler(mockedResponse.RESEND_CONFIRMATION.error.message),
          getErrorHandler(mockedResponse.RESEND_CONFIRMATION.error.message),
          mockedHandler,
        );
      });
      it('SHOULD throw error', async () => {
        const { stackId } = successLogin;
        await expect(
          client.mutate({
            mutation: RESEND_CONFIRMATION,
            variables: {
              userNameOrEmail: 'testing',
              stackId,
            },
          }),
        ).rejects.toThrow(mockedResponse.RESEND_CONFIRMATION.error.message);
        expect(mockedHandler).toHaveBeenCalled();
      });
    });
  });
  describe('GIVEN EXECUTE mutation', () => {
    describe('AND Given valid input', () => {
      beforeEach(() => {
        setClient('EXECUTE', 'success', EXECUTE);
      });
      it('SHOULD return valid response', async () => {
        const result = await client.mutate({
          mutation: EXECUTE,
          variables: executeParams,
        });

        expect(result.data).toHaveProperty('execute');
      });
    });
    describe('AND Given invalid input', () => {
      beforeEach(() => {
        setClient(
          'EXECUTE',
          'success',
          EXECUTE,
          getErrorHandler(mockedResponse.EXECUTE.error.message),
        );
      });

      it('SHOULD throw error', async () => {
        await expect(
          client.mutate({
            mutation: EXECUTE,
            variables: {
              ...executeParams,
              executeParameters: `{"userName":"You","password":"SamplePassword","platformId":${validStackId}}`,
            },
          }),
        ).rejects.toThrow(mockedResponse.EXECUTE.error.message);

        expect(mockedHandler).toHaveBeenCalled();
      });
    });
  });
});
