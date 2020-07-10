import { ApolloLink } from 'apollo-link';
import { setContext } from 'apollo-link-context';
import { HttpLink } from 'apollo-link-http';
import axios from 'axios';
import jwt from 'jsonwebtoken';

// import { EXECUTE } from '../mutations';
import { NO_STACK_URI, REFRESH_TOKEN_ACTION_ID } from '../config';

const EXECUTE = `
  mutation EXECUTE(
    $actionId: ID!
    $executionParameters: String
    $unrestricted: Boolean
  ) {
    Execute(
      actionId: $actionId
      executionParameters: $executionParameters
      unrestricted: $unrestricted
    )
  }
`;

async function refreshToken(stackId: string): Promise<string | null> {
  const token = localStorage.getItem('refreshToken');
  if (!token) {
    return null;
  }

  const executionParameters = JSON.stringify({
    refreshToken: token,
    platformId: stackId,
  });

  try {
    console.log(`inside refreshToken in ts.  stackId = ${stackId}`);
    const res = await axios({
      url: NO_STACK_URI,
      method: 'post',
      data: {
        query: EXECUTE,
        variables: {
          // REFRESH TOKEN ACTION
          actionId: REFRESH_TOKEN_ACTION_ID,
          executionParameters,
          unrestricted: true,
        },
      },
    });

    console.log(`res in ts.  res = ${JSON.stringify(res, null, 2)}`);

    if (!res.data || !res.data.data || !res.data.data.Execute) {
      return null;
    }

    const response = JSON.parse(res.data.Execute);
    // console.log(`response in ts = ${JSON.stringify(response, null, 2)}`);

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
