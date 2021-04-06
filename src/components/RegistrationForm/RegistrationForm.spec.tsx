import React from 'react';
import { render, fireEvent, wait } from '@testing-library/react';
import faker from 'faker';
import { MockedProvider } from '@apollo/react-testing';

import { REGISTER_USER } from 'mutations';
import { RegistrationForm } from '.';

faker.seed(123);

describe('<RegistrationForm />', () => {
  const onSuccessMock = jest.fn();

  beforeEach(() => {
    onSuccessMock.mockReset();
  });

  it('should render a form', async () => {
    const userClassId = faker.random.uuid();
    const userName = faker.internet.userName();
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const email = faker.internet.email();
    const password = faker.internet.password();
    const submitButtonText = faker.random.word();
    const mockSpy = jest.fn();

    const mocks = [
      {
        request: {
          query: REGISTER_USER,
          variables: {
            userClassId,
            name: userName,
            firstName,
            lastName,
            email,
            password,
          },
        },
        result: () => {
          mockSpy();

          return {
            data: {
              user: {
                id: faker.random.uuid(),
                name: `${firstName} ${lastName}`,
              },
            },
          };
        },
      },
    ];

    const { getByLabelText, getByText } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <RegistrationForm
          submitButtonText={submitButtonText}
          userClassId={userClassId}
          onSuccess={onSuccessMock}
        />
      </MockedProvider>,
    );

    const userNameField = getByLabelText(/username/i);
    const firstNameField = getByLabelText(/first name/i);
    const lastNameField = getByLabelText(/last name/i);
    const emailField = getByLabelText(/email/i);
    const passwordField = getByLabelText(/^password/i);
    const confirmPasswordField = getByLabelText(/confirm password/i);
    const submitButton = getByText(submitButtonText);

    await wait(() => {
      fireEvent.change(userNameField, {
        target: {
          value: userName,
        },
      });
    });

    await wait(() => {
      fireEvent.change(firstNameField, {
        target: {
          value: firstName,
        },
      });
    });

    await wait(() => {
      fireEvent.change(lastNameField, {
        target: {
          value: lastName,
        },
      });
    });

    await wait(() => {
      fireEvent.change(emailField, {
        target: {
          value: email,
        },
      });
    });

    await wait(() => {
      fireEvent.change(passwordField, {
        target: {
          value: password,
        },
      });
    });

    await wait(() => {
      fireEvent.change(confirmPasswordField, {
        target: {
          value: password,
        },
      });
    });

    await wait(() => {
      fireEvent.click(submitButton);
    });

    await wait(() => {
      expect(mockSpy).toHaveBeenCalledTimes(1);
      expect(onSuccessMock).toHaveBeenCalledTimes(1);
    });
  });
});
