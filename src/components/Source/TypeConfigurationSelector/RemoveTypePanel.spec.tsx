import * as React from 'react';
import { render, fireEvent, RenderResult } from '@testing-library/react';
import { MockedProvider } from '@apollo/react-testing';

import RemoveTypePanel, { REMOVE_TYPE_MUTATION } from './RemoveTypePanel';

describe('Source > DeleteType', () => {
  const testType = {
    id: 'test-id',
    name: 'test type',
  };

  const mocks = [
    {
      request: {
        query: REMOVE_TYPE_MUTATION,
        variables: {
          id: testType.id,
        },
      },
      result: {},
    },
  ];

  const renderTestComponent = (): RenderResult =>
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <RemoveTypePanel type={testType} />
      </MockedProvider>,
    );

  it('should render a confirmation question', () => {
    const { getByText } = renderTestComponent();

    expect(getByText(/are you sure/i).textContent).toBe(
      `This will delete ${testType.name} from all Sources. Are you sure?`,
    );
  });

  it('should render a confirmation button', () => {
    const { getByText } = renderTestComponent();

    const buttonElement = getByText(/yes/i);

    fireEvent.click(buttonElement);
  });

  it('should render a cancel button', () => {
    const { getByText } = renderTestComponent();

    getByText(/no/i);
  });
});
