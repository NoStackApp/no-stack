import { ApolloLink } from 'apollo-link';
import { setContext } from 'apollo-link-context';
import { HttpLink } from 'apollo-link-http';
import axios from 'axios';
import jwt from 'jsonwebtoken';

import { EXECUTE_ACTION } from '../mutations';
import { NO_STACK_URI } from '../config';

async function refreshToken(platformId: string): Promise<string | null> {
  const token = localStorage.getItem('refreshToken');
  if (!token) {
    return null;
  }

  const executionParameters = JSON.stringify({
    refreshToken: token,
    platformId,
  });

  try {
    const res = await axios({
      url: NO_STACK_URI,
      method: 'post',
      data: {
        query: EXECUTE_ACTION,
        variables: {
          // REFRESH TOKEN ACTION
          actionId: '96d3be63-53c5-418e-9167-71e3d43271e3',
          executionParameters,
          unrestricted: true,
        },
      },
    });

    if (!res.data || !res.data.data || !res.data.data.ExecuteAction) {
      return null;
    }

    const response = JSON.parse(res.data.data.ExecuteAction);

    if (
      !response.id ||
      !response.AuthenticationResult ||
      !response.AuthenticationResult.AccessToken
    ) {
      return null;
    }

    localStorage.setItem(
      'accessToken',
      response.AuthenticationResult.AccessToken,
    );

    return response.AuthenticationResult.AccessToken;
  } catch (e) {
    console.log(e);

    return null;
  }
}

export const createAuthLink = (platformId: string): ApolloLink =>
  setContext(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (_, { headers }): Promise<any> => {
      let token = localStorage.getItem('accessToken');
      if (!token) {
        return {
          headers,
        };
      }

      const decodedJwt = jwt.decode(token, { complete: true });
      if (!decodedJwt) {
        return {
          headers,
        };
      }

      // compare current time with token's scheduled expiry
      const isExpired =
        Math.ceil(Date.now() / 1000) >=
        (decodedJwt as { payload: { exp: number } }).payload.exp;

      if (isExpired) {
        token = await refreshToken(platformId);

        if (!token) {
          localStorage.clear();

          return {
            headers,
          };
        }
      }

      return {
        headers: {
          ...headers,
          jwt: token,
        },
      };
    },
  );

export const httpLink = new HttpLink({
  uri: NO_STACK_URI,
});
