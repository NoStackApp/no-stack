export const mockedResponse = {
  EXECUTE: {
    success: {
      data: {
        execute:
          '{"ChallengeParameters":{},"AuthenticationResult":{"AccessToken":"sampleaccesstoken"}}',
      },
    },
    error: {
      message: 'Error: Error: UserNotFoundException: User does not exist.',
    },
  },
  REGISTER_USER: {
    success: {
      data: {
        user: {
          id: '04ad8052-b014-4d75-816c-ef2300b32193',
          name: 'randomuser',
          __typename: 'User',
        },
      },
    },
    error: {
      message:
        "Error: InvalidParameterException: 2 validation errors detected: Value at 'username' failed to satisfy constraint: Member must satisfy regular expression pattern: [\\p{L}\\p{M}\\p{S}\\p{N}\\p{P}]+; Value at 'username' failed to satisfy constraint: Member must have length greater than or equal to 1",
    },
  },
  RESEND_CONFIRMATION: {
    success: {
      data: {
        resendConfirmation: '{"message":"Success!"}',
      },
    },
    error: {
      message:
        'Error: UserNotFoundException: Username/client id combination not found.',
    },
  },
  FORGOT_PASSWORD: {
    success: {
      data: {
        forgotPassword:
          '{"CodeDeliveryDetails":{"Destination":"r***@g***.com","DeliveryMedium":"EMAIL","AttributeName":"email"}}',
      },
    },
    error: {
      message: '',
    },
  },
  RESET_PASSWORD: {
    success: {
      data: {
        resetForgottenPassword: '{"message":"Success!"}',
      },
    },
    error: {
      message:
        'ExpiredCodeException: Invalid code provided, please request a code again.',
    },
  },
  VERIFY_TOKEN: {
    success: {
      data: {
        verifyToken: '{"message":"Success!"}',
      },
    },
    error: {
      message: 'Error: Error: NotAuthorizedException: Invalid Access Token',
    },
  },
  REFRESH_TOKEN: {
    success: {
      data: {
        refreshToken:
          '{"ChallengeParameters":{},"AuthenticationResult":{"AccessToken',
      },
    },
    error: {
      message:
        'AuthenticationError: NotAuthorizedException: Invalid Refresh Token',
    },
  },
  LOGIN: {
    success: {
      data: {
        login:
          '{"ChallengeParameters":{},"AuthenticationResult":{"AccessToken":"sub1.sub2.sub3","ExpiresIn":3600,"TokenType":"Bearer","RefreshToken":"","userId":"","userName":"","role":"USER"}}',
      },
    },
    error: {
      message: 'Error: NotAuthorizedException: Incorrect username or password.',
    },
  },
};
