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

// export const CREATE_INSTANCE = gql`
//   mutation CREATE_INSTANCE(
//     $id: ID!
//     $value: String
//     $typeId: ID!
//     $parentId: ID!
//     $parentTypeId: ID!
//     $treeId: ID!
//   ) {
//     addInstance(
//       typeId: $typeId
//       instanceID: $id
//       value: $value
//       parentTypeId: $parentTypeId
//       parentInstanceId: $parentId
//       treeId: $treeId
//     ) {
//       id
//       value
//     }
//   }
// `;
//
// export const ASSOCIATE_INSTANCES = gql`
//   mutation ASSOCIATE_INSTANCES(
//     $firstInstanceId: ID!
//     $secondInstanceId: ID!
//     $instanceAssnId: ID!
//     $typeAssnId: ID!
//   ) {
//     CreateInstanceAssn(id: $instanceAssnId) {
//       id
//     }
//
//     addAssnToFirstInstance: AddInstanceInstanceAssns(
//       instanceid: $firstInstanceId
//       instanceassnid: $instanceAssnId
//     ) {
//       id
//     }
//
//     addAssnToSecondInstance: AddInstanceInstanceAssns(
//       instanceid: $secondInstanceId
//       instanceassnid: $instanceAssnId
//     ) {
//       id
//     }
//
//     AddInstanceAssnAssn(instanceassnid: $instanceAssnId, assnid: $typeAssnId) {
//       id
//     }
//   }
// `;
//
// export const UPDATE_INSTANCE = gql`
//   mutation UPDATE_INSTANCE($id: ID!, $value: String, $order: Float) {
//     UpdateInstance(id: $id, value: $value, order: $order) {
//       id
//       value
//       order
//     }
//   }
// `;
//
// export const DELETE_INSTANCE = gql`
//   mutation DELETE_INSTANCE(
//     $typeId: ID!
//     $instanceId: ID!
//     $parentTypeId: ID!
//     $parentInstanceId: ID!
//     $treeId: ID!
//   ) {
//     RemoveInstance(
//       typeId: $typeId
//       instanceID: $instanceId
//       parentTypeId: $parentTypeId
//       parentInstanceId: $parentInstanceId
//       treeId: $treeId
//     )
//   }
// `;

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
      userClass: $userClassId
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
  mutation resendConfirmation($userNameOrEmail: String, $stackId: ID) {
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
