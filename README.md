# @nostack/no-stack

[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

NOTE: this is being released in ALPHA. Not yet stable!!!!

`no-stack` lets you build a full stack application using nothing but static front
end code. You can even run it without a server, for instance using an AWS S3 bucket
enabled as an endpoint.

To get the full value of `no-stack`, you need to register a platform. Currently,
you must do that at [www.nostack.net](www.nostack.net).

Then, you can build your virtual back end in one of two ways. (1) You can use our
api (api.matchlynx.com). (2) You can run your app as a user with "moderator" status.

You start by declaring types of users called user classes. Then, you give each class
actions. You can build whatever pages you like. You can declare and use data `Types`
which have `Instances`. `Types` also have `Assns` (associations) between each other.

A page can use data via `Sources`. Each source has some minimal necessary `Assns`
and the `Types` that you need. You can also create `Constraints` on the `Instances`
returned.

This repository contains the `no-stack` helper components and functions. Documentation
coming shortly...

## Getting Started

### Prerequisites

Be sure you have the latest stable version of [Node & NPM](https://nodejs.org/en/download/)
installed. Depending on your machine, you would probably need to
[fix permissions for NPM](https://stackoverflow.com/questions/16151018/npm-throws-error-without-sudo).

You might also need to install [TypeScript](https://www.typescriptlang.org/#download-links)
globally.

### Install Dependencies

`no-stack` requires React & Apollo as dependencies.

To install React, use `create-react-app` and bootstrap your app by following
[these directions](https://facebook.github.io/create-react-app/docs/getting-started).

Then `cd` into your app folder and install Apollo:

```bash
npm install @apollo/react-common @apollo/react-components @apollo/react-hoc \
  @apollo/react-hooks @shopify/react-compose apollo-cache-inmemory \
  apollo-client graphql apollo-link --save
```

Install the rest of `no-stack`'s dependencies:

```bash
npm install apollo-fetch apollo-link-context apollo-link-http axios formik \
  graphql-tag jsonwebtoken react-graph-vis react-spinkit styled-components \
  uuid --save
```

### Install `no-stack` via NPM/Yarn

```bash
npm install @nostack/no-stack --save
```

### Initial Set-Up

This guide will create a basic set-up for your React & Apollo instances. If you need
a more complicated set-up, please refer to their respective official documentation.

#### Setting up React and Apollo

Edit `src/index.js` file like so:

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';

import './index.css';

import client from './client'; // we will create this file
import App from './App';
import * as serviceWorker from './serviceWorker';

// wrap your app inside ApolloProvider
ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
```

Then edit `src/client/index.js`:

```javascript
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { InMemoryCache } from 'apollo-cache-inmemory';

import { createAuthLink, httpLink } from '@nostack/no-stack';

const PLATFORM_ID = 'your-platform-id';

const authLink = createAuthLink(PLATFORM_ID);

const link = ApolloLink.from([authLink, httpLink]);

export default new ApolloClient({
  link,
  cache: new InMemoryCache({
    dataIdFromObject: object => object.id,
  }),
});
```

#### Cache Set-Up

To allow `no-stack`'s helper functions (discussed below) to access and update
Apollo's cache, `dataIdFromObject` must be set up like we did above, which we
repeat here:

```javascript
const client = new ApolloClient({
  // ...other options...
  cache: new InMemoryCache({
    // ... other options ...
    dataIdFromObject: object => object.id,
  }),
});
```

#### Bootstrapping Your Application

To enable `no-stack`'s features in your application, you need to replace
`<ApolloProvider>` with `<NoStackProvider>` component. You may do so by adding
it in our previous `src/index.js` file like so:

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import { NoStackProvider } from '@nostack/no-stack';

import './index.css';

import client from './client'; // we will create this file
import App from './App';
import * as serviceWorker from './serviceWorker';

const PLATFORM_ID = 'your-platform-id';

// wrap your app inside NoStackProvider
// then wrap NoStackProvider inside ApolloProvider
ReactDOM.render(
  <NoStackProvider client={client} platformId={PLATFORM_ID}>
    <App />
  </NoStackProvider>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
```

`<NoStackProvider>` uses Apollo's `<ApolloProvider>` under the hood.

The only required props of `<NoStackProvider>` is your `platformId`
and the `client`.

## Usage

### Authentication

`no-stack` provides a helper components, `<LoginForm>` & `<LogoutButton>` to automate
login & logout. Sample usage:

```javascript
import React from 'react';
import { LoginForm, LogoutButton } from '@nostack/no-stack';

const SomeComponent = () => (
  <NoStackConsumer>
    {({ currentUser, loading }) => {
      if (loading) return 'Loading...';

      if (!currentUser) {
        return <LoginForm />;
      }

      return <LogoutButton />;
    }
  </NoStackConsumer>
);

export default SomeComponent;
```

Note: `<LogoutButton>` hides itself automatically if user is not logged in.

#### `<NoStackConsumer>` Component

To access the authentication state of the user, you will need `<NoStackConsumer>`.
Sample usage was illustrated above.

It also provides some helper methods if you want to customize your login/logout
behavior.

##### `<NoStackConsumer>` Function as a Child (FAAC) Props

- `platformId` - The current platform's ID

- `currentUser` - The current user object
  `{id: 'some-id', name: 'some-name', role: 'some-role'}`

- `loading` - Boolean. `true` if currently validating user with API.

- `login({ username: 'some-username', password: 'some-password' })` - Helper function
  to log in a user with credentials. If successful, it sets `currentUser` and stores
  auth tokens in browser's `localStorage`.

- `logout(callback)` - Helper function to log out user. Removes `currentUser`
  and all auth tokens. Executes provided callback function after logout.

##### Alternative: `withNoStack` Higher Order Component

You may interchage `<NoStackConsumer>` with `withNoStack` HOC and achieve the
same effect:

```javascript
import { withNoStack } from '@nostack/no-stack';

const SomeComponent = ({ currentUser, loading, login, logout }) => {
  if (loading) return 'Loading...';

  if (!currentUser) {
    return <LoginForm onSubmit={login} />;
  }

  return <LogoutButton onClick={logout} />;
};

export default withNoStack(SomeComponent);
```

`withNoStack` also provides the same props that `<NoStackConsumer>`'s FAAC provides.
Feel free to use either, whatever suits your preference or situation.

### Platform Management Console

After setting up authentication, the second thing you might want to implement
is the `<Console>`.

The `<Console>` component is provided for the sole purpose of managing your
current platform (i.e. adding, editing, and deleting user classes). When a
moderator is logged in, It displays a transparent button on the lower left
(or lower right) corner of the page you insert it into. When that button
is clicked, a modal showing your dashboard will pop up.

You may place it anywhere on your app, as long as it's a child or further
down the hierarchy of a `<NoStackProvider>`. We do suggest that you place it
near the root of your application so that the button is accessible in all your pages.

Sample usage:

```javascript
import { Console, NoStackProvider } from '@nostack/no-stack';

import RootComponent from './RootComponent';

export default const App = () => (
  <NoStackProvider>
    <Console position="left" />
    <RootComponent />
  </NoStackProvider>
);
```

`position` prop - Displays your console either on the bottom `left` or
bottom `right` of the current page (default: `left`)

### Data Retrieval via the `<Source>` Component (Experimental)

`no-stack` provides a `<Source>` component for retrieving data.
`no-stack` uses GraphQL. See this [Intro to GraphQL](https://graphql.org/learn/)
for more info about using GraphQL, and
[GraphQL Queries](https://graphql.org/learn/queries/) in particular.

The `no-stack` `Source` Component is very close to the
[Apollo Client Query Component](https://www.apollographql.com/docs/react/api/react-components/#query).
Both take the same prop of a `query`.

Following is an example usage.

```javascript
import React from 'react';
import { Source } from '@nostack/no-stack';
import gql from 'graphql-tag';

const SOURCE_QUERY = gql`
  query SOURCE(
    $id: ID!
    $typeRelationships: String!
    $parameters: String
    $unrestricted: Boolean!
  ) {
    sourceData(
      sourceId: $id
      typeRelationships: $typeRelationships
      parameters: $parameters
      unrestricted: $unrestricted
    ) {
      instance {
        id
        value
        type
      }
      children {
        instance {
          id
          value
          type
        }
        children {
          instance {
            id
            value
            type
          }
        }
      }
    }
  }
`;

const sourceId = 'your-source-id';

const typeRelationships = {
  'first-type-id': {
    'second-type-id': {
      'third-type-id': null,
    },
  },
};

const unrestricted = true;

const YourComponent = ({ someParam }) => {
  const parameters = {
    someParam,
  };

  return (
    <Source
      id={sourceId}
      typeRelationships={typeRelationships}
      query={SOURCE_QUERY}
      unrestricted={unrestricted}
      parameters={parameters}
    >
      {({ loading, error, data }) => {
        if (loading) {
          return 'Loading...';
        }

        if (error) return `Error: ${error.graphQLErrors}`;

        console.log(data);

        return <div>Test Source</div>;
      }}
    </Source>
  );
};

export default YourComponent;
```

#### `<Source>` Props

- `id` - the source ID

- `typeRelationships` - the desired return type hierarchy (see below)

- `query` - the GraphQL tagged query string or file (see below)

- `parameters` - an object consisting of key-value pairs representing the required
  constraints of the source

- `unrestricted` - boolean; `true` if data is available to public, `false` if
  otherwise. (default: false)

#### `typeRelationships` Prop

A source can be thought of as a virtual table, like a view in a relational database.
Each type is like a column. In relational terms, the `typeRelationships` prop is
like a "projection" (letting you specify which of the "columns" (types) you want
returned in your request.

But, unlike with a table, the data returned here is a hierarchy, where a child type's
instances are grouped based on the parent type's instances. So when you specify what
you want, you must start with the highest level of that hierarchy (the root), and
then list it's children (if any). You then do the same recursively for each subtree.

Therefore, the `typeRelationships` is tree, specified as a JSON. The format is as
follows:

```json
{
  <parentType>: {
    <child1>: {
      <child1a>: <child1a-subtree>,
      <child1b>: <child1b-subtree>,
      ...
    },
    <child2>: {
      <child2a>: <child2a-subtree>,
      <child2b>: <child2b-subtree>,
      ...
    },
    ...
  },
}
```

The simplest case would be a single type with no children:
`{ doctor_type_id: {} }`. In this case, doctor has no child.

A bit more complex would be a type with one child:
`{ doctor_type_id: { nurse_type_id: {}, patient_type_id: {} }}`. In this case,
each doctor will be returned with children including nurses for each doctor and patients
for each doctor.

A third possibility is this:

```json
{
  "doctor_type_id": {
    "nurse_type_id": {
      "patient_type_id": {}
    }
  }
}
```

Note that here each doctor will have nurses, and each nurse will have patients.

Usually, a `typeRelationships` won't be large at all. (That's probably better style
anyway. In general, `no-stack` encourages minimizing state on the front end.)

Some important notes:

- If a type does not have child types, represent it by setting the type to `{}`.

- Neither the choice of fields nor their place in the hierarchy will constrain the
  data returned. The data for a source at any given moment is fixed, and the type
  hierarchy simply selects what columns are returned and the grouping. For example,
  say that a source contains a set of doctors, nurses, and patients. Then all of
  the doctors contained in that source will be returned whether the type hierarchy
  has just doctors or doctors and nurses. The reason is that if a doctor had no nurses
  than he or she would not be included in the source in the first place.

- That said, the data returned is distinct within the selected sets. So a small
  `typeRelationships` might well return fewer instances than a larger one. The rule
  is that each instance of the root type appears only once, and each instance of
  a child type appears only once for its parent instance. For instance, if Doctor
  A has ten nurses, then listing by doctor as the root would show Doctor A once with
  all ten of his nurses, whereas listing by nurse first would show the same doctor
  ten times, once for each nurse.

#### `query` Prop

As stated above, The `Source` Component is very close to the
[Apollo Client Query Component](https://www.apollographql.com/docs/react/api/react-components/#query).
Both take the same prop of a `query`.

The query prop is the actual query to use. In the case above, it is a `gql` specification.
In addition, you can provide a file that includes the complete query specification.

The plan in the near future is to generate such files for you, which you can then
insert into your project. In the meantime, you must generate it yourself.

Fundamentally, the query `sourceData` is called with four variables (which is provided
by `Source`'s props discussed above):

```graphql
  $id: ID!
  $typeRelationships: String!
  $parameters: String
  $unrestricted: Boolean!
```

#### Fields requested

A call to a GraphQL API allows you as the developer to decide which specific "fields"
you want to request to be part of the returned data.

`no-stack` uses GraphQL. See [GraphQL Query Fields](https://graphql.org/learn/queries/#fields)
for an introduction.

Specifically, information about the instances for types in your `typeHiearchy` are
returned. For each returned instance you can choose from the following fields in
your `SourceData` request:

```graphql
{
  id,
  type,
  instance {
    id,
    value,
    order
  },
  children {
    ...
}
```

The `children` field can recursively contain any of these same fields as deeply as
you desire up to the depth of its `typeRelationships`.

The meaning of the fields is as follows:

- `id` - current type's id

- `type` - the instance type

- `instance` - the instance info. Specifically includes the `id` for the instance,
  as well as it's `value` and an `order` if one exists. Every instance has an id;
  some instances don't have values or orders.

- `children` - any child instances for this instance. See the `typeRelationships`
  explanation above to understand how the relationships are specified there.

Here is an example of the fields requested. This json specifies all of the data
to a depth of 3:

```graphql
{
  id
  type
  instance {
    id
    value
    order
  }
  children {
    id
    type
    instance {
      id
      value
      order
    }
    children {
      id
      type
      instance {
        id
        value
        order
      }
    }
  }
}
```

In general, you should request up to the depth of your `typeRelationships` (see above).
Anything less will be missing data, and anything more will not return anything.

#### `<Source>` Function as a Child (FAAC) Props

- `loading` - boolean; `true` if data is still being fetched, `false` if otherwise.
- `error` - error object; `null` if there's operation succeeds.
- `data` - the data object.
- `queryVariables` - object containing the props provided to the `<Source>` (refer
  to discussion above).
- `refetchQueries` - a single element array containing the object to be fed to Apollo
  mutation's own `refetchQueries`property (see mutation discussion below).
- `updateSourceAfterCreateAction(instance)` - a higher-order function function for
  updating Apollo cache after creating an instance (see mutation discussion below).
- `updateSourceAfterUpdateAction(instanceId, fragment)` - a higher-order function
  for updating Apollo cache after updating an instance (see mutation discussion below).

#### `<Source>` Inspector

In addition to data retrieval, the `<Source>` component also has a data inspector
modal that is accessible to any logged-in platform moderator.

You don't have to do anything special in your code to enable this feature. Once you're
logged in as a moderator via `<NoStackConsumer>`, a button with the plus (+) sign
will show on every instance of the `<Source>` component on the current page.

The inspector currently only shows the relationships between types of data (nodes)
via a type tree graph visualization. But you will eventually be able to manage your
data type tree (i.e. add/remove types) using the inspector.

### Manipulating Data via Action Mutations (Experimental)

Currently, data manipulation uses Apollo's GraphQL components. `no-stack` provides
a mutation helper you can plug into Apollo's `<Mutation>` component called `EXECUTE_ACTION`:

```javascript
import { Mutation } from '@apollo/react-components';
import { EXECUTE_ACTION } from '@nostack/no-stack';

const YourComponent = () => (
  <Mutation mutation={EXECUTE_ACTION} >
  {(executeAction, { data }) =>
    if (data) {
      console.log(data);
    }

    return (
      <div>
        <button onClick={() => executeAction({
            variables: {
              actionId: 'dummy-id',
              executionParameters: JSON.stringify({ someParameter: 'value' }),
              unrestricted: false,
            },
        })}>
          Execute Action
        </button>
      </div>
    );
  }
  </Mutation>
);
```

Or, via Apollo's `graphql` HOC:

```javascript
import { graphql } from '@apollo/react-hoc';
import { EXECUTE_ACTION } from '@nostack/no-stack';

const YourComponent = ({ executeAction }) => (
  <div>
    <button onClick={async () => {
      const { data } = await executeAction({
        variables: {
          actionId: 'dummy-id',
          executionParameters: JSON.stringify({ someParameter: 'value' }),
          unrestricted: false,
        },
      });

      console.log(data);
    }>
      Execute Action
    </button>
  </div>
);

export default graphql(
  EXECUTE_ACTION,
  {
    name: 'executeAction',
  },
)(YourComponent);
```

Depending on its type, the action called with `EXECUTE_ACTION` can perform different
mutations, including but not limited to creating/updating/deleting instances, logging
in/out, and user registration.

#### EXECUTE_ACTION SIGNATURE

| Variable            | Description                                                             | Value                                                      | Required              |
| ------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------- | --------------------- |
| actionId            | An existing action ID                                                   | ID                                                         | Yes                   |
| executionParameters | An object describing the optional and required parameters of the action | Valid JSON String (use `JSON.stringify()`)                 | Depends on the action |
| unrestricted        | Signifies if the action authorization                                   | `true` if restricted to logged in users (default: `false`) | No                    |

### Updating Apollo Cache After Action Mutations

Apollo implements a front end store for all GraphQL queries that get executed which
they call the "cache".

Usually, after calling GraphQL mutations, or particularly in `no-stack`'s case, action
mutations, the data on the backend and on the Apollo Cache become out of sync. To
keep Apollo Cache in sync, [you need to access it directly](https://www.apollographql.com/docs/react/advanced/caching/#direct-cache-access).

To help make this process easier, no-stack's `<Source>` component provides a few
helpers via its render props. (Note: Sample usage code is from the demo [Todo App](https://github.com/NoStackApp/stackbox-todo).)

#### `refetchQueries`

`refetchQueries` is an array to be used with
[Apollo mutation's `refetchQueries` props](https://www.apollographql.com/docs/react/api/react-apollo/#optionsrefetchqueries).
This is the most convenient way of updating the Apollo cache. But it is also the
slowest, since it requires making a roundtrip HTTP transaction with the `no-stack`
API.

For usage, see [`<CreateIsCompletedForm>`](https://github.com/NoStackApp/stackbox-todo/blob/non-root-list-type/src/components/CreateIsCompletedForm/index.js#L40).

#### `updateSourceAfterCreateAction(instance)`

`updateSourceAfterCreateAction` is a higher-order function that returns a function
that fits the signature for the callback used by [Apollo mutation's `update` property](https://www.apollographql.com/docs/react/api/react-apollo/#optionsupdate).
As the function name suggests, this is mostly suitable after an action that creates
an instance.

For sample usage, see [`<CreateProjectForm>`](https://github.com/NoStackApp/stackbox-todo/blob/yisroel/src/components/CreateProjectForm/index.js#L43).
Note: `<CreateProjectForm>`'s parent passes it `updateSourceAfterCreateAction` as
the `onAdd` prop.

A slightly more complicated usage is found in [`<CreateTodoForm>`](https://github.com/NoStackApp/stackbox-todo/blob/yisroel/src/components/CreateTodoForm/index.js#L79).

#### `updateSourceAfterUpdateAction(instanceId, fragment)`

`updateSourceAfterUpdateAction` is similar to `updateSourceAfterCreateAction`, but
it is meant to be used for updating the cache after an action that updates an instance.

For sample usage, see [`<Project>`](https://github.com/NoStackApp/stackbox-todo/blob/yisroel/src/components/Project/index.js#L57).

#### `updateSourceAfterDeleteAction(instanceId)`

`updateSourceAfterDeleteAction` is similar to `updateSourceAfterDeleteAction`, but
it is meant to be used for updating the cache after an action that deletes an instance.

For sample usage, see [`<Project>`](https://github.com/NoStackApp/stackbox-todo/blob/yisroel/src/components/Project/index.js#L75).
