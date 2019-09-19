/* eslint-disable import/prefer-default-export */
import React from 'react';
import { Query } from '@apollo/react-components';
import { MutationUpdaterFn } from 'apollo-client';
import { DocumentNode } from 'graphql';

import { NoStackConsumer } from '../NoStackContext';
import SourceInfoButton from './SourceInfoButton';

export interface UnitInterface {
  id: string;
  query: DocumentNode;
  typeRelationships: object;
  unrestricted: boolean;
  parameters: Record<string, any>;
  children: (props: object) => JSX.Element;
}

export interface Instance {
  instance: {
    id: string;
    value: string;
    __typename?: string;
  };
  __typename: string;
}

export interface Response {
  ExecuteAction: string;
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
      const data = response.data && JSON.parse(response.data.ExecuteAction);

      newInstance = {
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

  const updateUnitAfterUpdateAction = (
    instanceId: string,
    fragment: DocumentNode,
  ): MutationUpdaterFn<Response> => (cache, response): void => {
    const data = response.data && JSON.parse(response.data.ExecuteAction);

    cache.writeFragment({
      id: instanceId,
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
          {currentUser &&
            currentUser.role &&
            currentUser.role === 'MODERATOR' && <SourceInfoButton id={id} />}
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
                updateUnitAfterUpdateAction,
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
