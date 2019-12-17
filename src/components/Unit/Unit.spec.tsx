import React from 'react';
import { render, wait } from '@testing-library/react';
import { MockedProvider } from '@apollo/react-testing';
import gql from 'graphql-tag';
import faker from 'faker';

import Unit from '.';

const TEST_QUERY = gql`
  query Unit($id: ID!, $typeRelationships: String!, $parameters: String) {
    unitData(
      unitId: $id
      typeRelationships: $typeRelationships
      parameters: $parameters
    ) {
      instance {
        id
        value
      }
    }
  }
`;

const testTypeId = faker.random.uuid();

const testTypeRelationships = {
  [testTypeId]: null,
};

const testParameters = {};

const testVariables = {
  id: faker.random.uuid(),
  typeRelationships: JSON.stringify(testTypeRelationships),
  unrestricted: false,
  parameters: JSON.stringify(testParameters),
};

const testData = [
  {
    id: faker.random.uuid(),
    type: testTypeId,
    instance: {
      id: faker.random.uuid(),
      value: faker.random.words(),
    },
  },
  {
    id: faker.random.uuid(),
    type: testTypeId,
    instance: {
      id: faker.random.uuid(),
      value: faker.random.words(),
    },
  },
];

describe('Unit component', () => {
  const mocks = [
    {
      request: {
        query: TEST_QUERY,
        variables: testVariables,
      },
      result: {
        data: {
          unitData: testData,
        },
      },
    },
  ];

  const renderTestComponent = () =>
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Unit
          id={testVariables.id}
          query={TEST_QUERY}
          typeRelationships={testTypeRelationships}
          unrestricted={false}
          parameters={testParameters}
        >
          {({ loading, error, data }) => {
            if (loading) {
              return <div>Loading</div>;
            }

            if (error) {
              return <div>{error.message}</div>;
            }

            return (
              <div>
                {data.unitData.map(({ instance }) => (
                  <div key={instance.id}>
                    {instance.id} {instance.value}
                  </div>
                ))}
              </div>
            );
          }}
        </Unit>
      </MockedProvider>,
    );

  it('should render data properly', async () => {
    const { getByText } = renderTestComponent();

    expect(getByText(/loading/i)).toBeTruthy();

    await wait();

    expect(() => getByText(/loading/i)).toThrow();

    let testRegExp = new RegExp(testData[0].instance.value, 'i');
    expect(getByText(testRegExp)).toBeTruthy();

    testRegExp = new RegExp(testData[1].instance.value, 'i');
    expect(getByText(testRegExp)).toBeTruthy();
  });
});
