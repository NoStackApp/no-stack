import gql from 'graphql-tag';

export const EXECUTE = gql`
  mutation EXECUTE(
    $actionId: ID!
    $executionParameters: String
    $unrestricted: Boolean
  ) {
    execute(
      actionId: $actionId
      executionParameters: $executionParameters
      unrestricted: $unrestricted
    )
  }
`;

export const REGISTER_USER = gql`
  mutation REGISTER_USER(
    $userClassId: ID!
    $name: String!
    $firstName: String!
    $lastName: String!
    $email: String!
    $password: String!
    $formValues: String
  ) {
    user: createUserOnPlatform(
      userClassId: $userClassId
      name: $name
      firstName: $firstName
      lastName: $lastName
      email: $email
      password: $password
      formValues: $formValues
    ) {
      id
      name
    }
  }
`;

// added 2020-05-07
export const RESEND_CONFIRMATION = gql`
  mutation resendConfirmation($userNameOrEmail: String!, $stackId: ID!) {
    resendConfirmation(userNameOrEmail: $userNameOrEmail, stackId: $stackId)
  }
`;

export const FORGOT_PASSWORD = gql`
  mutation FORGOT_PASSWORD($userNameOrEmail: String!, $stackId: ID!) {
    forgotPassword(userNameOrEmail: $userNameOrEmail, stackId: $stackId)
  }
`;

export const RESET_PASSWORD = gql`
  mutation RESET_PASSWORD(
    $userNameOrEmail: String!
    $password: String!
    $code: String!
    $stackId: ID!
  ) {
    resetForgottenPassword(
      userNameOrEmail: $userNameOrEmail
      password: $password
      code: $code
      stackId: $stackId
    )
  }
`;
