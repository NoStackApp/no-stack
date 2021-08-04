import { config } from 'dotenv';

config();

export const validStackId = process.env.STACK_ID;

export const validUserNameOrEmail = process.env.USERNAME;

export const validPassword = process.env.PASSWORD;

export const successLogin = {
  userNameOrEmail: validUserNameOrEmail,
  password: validPassword,
  stackId: validStackId,
};

export const failedLogin = {
  userNameOrEmail: 'Me',
  password: 'O',
  stackId: validStackId,
};

export const successCreateUser = {
  userClassId: 'ba6509d6-8867-4991-9cfd-df407d44f0f1',
  name: 'randomuser2',
  firstName: 'randomuser2',
  lastName: 'clarke',
  email: 'test@test.com',
  password: 'Pa55word^',
  formValues:
    '{"app":"RentAYak","description":"A marketplace for renting Yaks","csv":148,"creditCardNumber":"5500000000000004","expirationDate":"0125"}',
};

export const executeParams = {
  actionId: 'a0d89c1f-c423-45e0-9339-c719dcbb7afe',
  executionParameters: `{"userName":"${validUserNameOrEmail}","password":"${validPassword}","platformId":"${validStackId}"}`,
  unrestricted: true,
};
