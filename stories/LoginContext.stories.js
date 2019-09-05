import React from 'react';
import { storiesOf } from '@storybook/react';

import { LoginProvider, LoginConsumer } from '../src';

storiesOf('LoginContext', module).add('Test Render', () => (
  <LoginProvider>
    <LoginConsumer>
      {({ currentUser }) => {
        if (!currentUser) {
          return <div>Logged Out</div>;
        }

        return (
          <div>
            {currentUser.id} - {currentUser.name}
          </div>
        );
      }}
    </LoginConsumer>
  </LoginProvider>
));
