import React from 'react';
import { render, wait } from '@testing-library/react';
import { MockedProvider } from '@apollo/react-testing';
import gql from 'graphql-tag';
import faker from 'faker';

import Source from '.';

const TEST_QUERY = gql`
  query SOURCE($id: ID!, $typeRelationships: String!, $parameters: String) {
    sourceData(
      sourceId: $id
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

describe('Source component', () => {
  const mocks = [
    {
      request: {
        query: TEST_QUERY,
        variables: testVariables,
      },
      result: {
        data: {
          sourceData: testData,
        },
      },
    },
  ];

  const renderTestComponent = () =>
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Source
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
                {data.sourceData.map(({ instance }) => (
                  <div key={instance.id}>
                    {instance.id} {instance.value}
                  </div>
                ))}
              </div>
            );
          }}
        </Source>
      </MockedProvider>,
    );

  it('should render properly', async () => {
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
