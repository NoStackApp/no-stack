import React from 'react';
import { render, wait, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/react-testing';
import faker from 'faker';

import { SOURCE_QUERY } from '../queries';
import Popup from '.';

faker.seed(123);

describe('UnitInspector <Popup />', () => {
  const testUnitData = {
    id: faker.random.uuid(),
    name: faker.random.word(),
    sortings: [],
    types: [],
    constraints: [],
    tree: {
      id: faker.random.uuid(),
      name: faker.random.word(),
      root: null,
      assns: [],
      nodes: [],
    },
  };

  const mocks = [
    {
      request: {
        query: SOURCE_QUERY,
        variables: {
          id: testUnitData.id,
        },
      },
      result: {
        data: {
          Source: [testUnitData],
        },
      },
    },
  ];

  const renderPopup = () =>
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Popup id={testUnitData.id}>
          {({ unit }) => (
            <>
              <div>{unit.id}</div>
              <div>{unit.name}</div>
              <div>{unit.tree.id}</div>
              <div>{unit.tree.name}</div>
            </>
          )}
        </Popup>
      </MockedProvider>,
    );

  it('should render properly', async () => {
    const { container, findByText } = renderPopup();

    expect(container.firstChild).toBeNull();

    expect(
      await findByText('+', {
        selector: 'button',
      }),
    ).toBeTruthy();
  });

  describe("'+' button is clicked", () => {
    it('should render children', async () => {
      const { findByText, queryByText, getByText } = renderPopup();

      expect(queryByText(testUnitData.id)).toBeNull();
      expect(queryByText(testUnitData.name)).toBeNull();
      expect(queryByText(testUnitData.tree.id)).toBeNull();
      expect(queryByText(testUnitData.tree.name)).toBeNull();

      const showButton = await findByText('+', {
        selector: 'button',
      });

      fireEvent.click(showButton);

      await wait(() => {
        expect(getByText(testUnitData.id)).toBeTruthy();
        expect(getByText(testUnitData.name)).toBeTruthy();
        expect(getByText(testUnitData.tree.id)).toBeTruthy();
        expect(getByText(testUnitData.tree.name)).toBeTruthy();
      });
    });
  });
});
