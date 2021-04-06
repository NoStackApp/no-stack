import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import faker from 'faker';

import { RawLoginForm as LoginForm } from '.';

faker.seed(123);

describe('<LoginForm />', () => {
  const loginMock = jest.fn();

  beforeEach(() => {
    loginMock.mockReset();
  });

  it('should initially not render', () => {
    const { container } = render(<LoginForm loading login={loginMock} />);

    expect(container.firstChild).toBeNull();
  });

  it('should not render if logged in', () => {
    const { container } = render(
      <LoginForm loading={false} currentUser login={loginMock} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render login form if not signed in', () => {
    const submitButtonText = faker.random.word();
    const username = faker.random.word();
    const password = faker.random.word();

    const { getByLabelText, getByText } = render(
      <LoginForm login={loginMock} submitButtonText={submitButtonText} />,
    );

    const usernameInput = getByLabelText(/username/i);
    const passwordInput = getByLabelText(/password/i);
    const button = getByText(submitButtonText);

    fireEvent.change(usernameInput, {
      target: {
        value: username,
      },
    });

    fireEvent.change(passwordInput, {
      target: {
        value: password,
      },
    });

    fireEvent.click(button);

    expect(loginMock).toHaveBeenCalledTimes(1);
    expect(loginMock).toHaveBeenCalledWith({
      username,
      password,
    });
  });
});
