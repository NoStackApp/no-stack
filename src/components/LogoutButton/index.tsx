import React, { FunctionComponent } from 'react';
import styled from 'styled-components';

import { withNoStack } from '../NoStackContext';

const Button = styled.button`
  cursor: pointer;
`;

interface ButtonProps {
  currentUser?: any;
  logout: () => void;
  buttonText?: string;
}

export const RawLogoutButton: FunctionComponent<ButtonProps> = ({
  currentUser = null,
  logout,
  buttonText = 'Log Out',
}): JSX.Element | null =>
  currentUser ? (
    <Button type="button" onClick={(): void => logout()}>
      {buttonText}
    </Button>
  ) : null;

export const LogoutButton = withNoStack(RawLogoutButton);
