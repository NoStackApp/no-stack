import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import faker from 'faker';

import { RawLogoutButton as LogoutButton } from '.';

faker.seed(123);

describe('<LogoutButton />', () => {
  const logoutMock = jest.fn();

  beforeEach(() => {
    logoutMock.mockReset();
  });

  it('should not render if not logged in', () => {
    const { container } = render(<LogoutButton logout={logoutMock} />);

    expect(container.firstChild).toBeNull();
  });

  it('should render a button of logged in', () => {
    const currentUser = {
      id: faker.random.uuid(),
      name: faker.random.words(),
    };

    const buttonText = faker.random.word();

    const { getByText } = render(
      <LogoutButton
        currentUser={currentUser}
        logout={logoutMock}
        buttonText={buttonText}
      />,
    );

    const button = getByText(buttonText);

    fireEvent.click(button);

    expect(logoutMock).toHaveBeenCalledTimes(1);
  });
});
