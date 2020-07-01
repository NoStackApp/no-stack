/* eslint-disable import/prefer-default-export */
import React from 'react';
import { Query } from '@apollo/react-components';
import { MutationUpdaterFn } from 'apollo-client';
import { DocumentNode } from 'graphql';

import { NoStackConsumer } from '../NoStackContext';
import UnitInspector from '../UnitInspector';

export interface UnitInterface {
  id: string;
  query: DocumentNode;
  typeRelationships: object;
  unrestricted: boolean;
  parameters: Record<string, any>;
  children: (props: object) => JSX.Element;
}

export interface Instance {
  id: string;
  instance: {
    id: string;
    value: string;
    __typename?: string;
  };
  __typename: string;
}

export interface Response {
  Execute: string;
}

export const Unit: React.FunctionComponent<UnitInterface> = ({
  id,
  query,
  typeRelationships,
  unrestricted = false,
  parameters,
  children,
}): JSX.Element => {
  const queryVariables = {
    id,
    typeRelationships: JSON.stringify(typeRelationships),
    unrestricted,
    parameters: JSON.stringify(parameters),
  };

  const refetchQueries = [
    {
      query,
      variables: queryVariables,
    },
  ];

  const updateUnitAfterCreateAction = (
    instance: Instance,
  ): MutationUpdaterFn<Response> => (cache, response): void => {
    let newInstance: Instance;

    if (instance) {
      newInstance = instance;
    } else {
      const data = response.data && JSON.parse(response.data.Execute);

      newInstance = {
        id: data.instanceId,
        instance: {
          id: data.instanceId,
          value: data.value,
          __typename: 'Instance',
        },
        __typename: 'InstanceWithTypedChildren',
      };
    }

    const { unitData } = cache.readQuery({
      query,
      variables: {
        ...queryVariables,
      },
    }) as { unitData: Instance[] };

    cache.writeQuery({
      query,
      variables: {
        ...queryVariables,
      },
      data: {
        unitData: [newInstance, ...unitData],
      },
    });
  };

  const updateUnitInstanceAfterUpdateAction = (
    instanceId: string,
    fragment: DocumentNode,
  ): MutationUpdaterFn<Response> => (cache, response): void => {
    const data = response.data && JSON.parse(response.data.Execute);

    cache.writeFragment({
      id: `${instanceId}Instance`,
      fragment,
      data: {
        id: instanceId,
        value: data.value,
        __typename: 'Instance',
      },
    });
  };

  const updateUnitAfterDeleteAction = (
    instanceId: string,
  ): MutationUpdaterFn<Response> => (cache): void => {
    const { unitData } = cache.readQuery({
      query,
      variables: {
        ...queryVariables,
      },
    }) as { unitData: Instance[] };

    cache.writeQuery({
      query,
      variables: {
        ...queryVariables,
      },
      data: {
        unitData: unitData.filter(
          ({ instance }): boolean => instance.id !== instanceId,
        ),
      },
    });
  };

  return (
    <NoStackConsumer>
      {({ currentUser }): JSX.Element => (
        <div>
          <UnitInspector id={id} currentUser={currentUser} />
          <Query<{}, {}> query={query} variables={queryVariables}>
            {({ loading, error, data }): JSX.Element => {
              if (loading) return children({ loading, error, data });

              if (error) return children({ error });

              return children({
                error,
                data,
                loading,
                queryVariables,
                refetchQueries,
                updateUnitAfterCreateAction,
                updateUnitInstanceAfterUpdateAction,
                updateUnitAfterDeleteAction,
              });
            }}
          </Query>
        </div>
      )}
    </NoStackConsumer>
  );
};

export default Unit;
