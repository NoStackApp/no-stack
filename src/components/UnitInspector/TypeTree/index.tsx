import React from 'react';
import Graph from 'react-graph-vis';

import { Source, Type, Sorting, Constraint, Assn, Tree } from '../types';

interface Node {
  id: string;
  label: string;
  group: string;
}

interface Edge {
  from: string;
  to: string;
}

function treeToGraph(
  tree: Tree,
  types: Type[],
  constraints: Constraint[],
  sortings: Sorting[],
): {
  nodes: Node[];
  edges: Edge[];
} {
  const sortingSelector = sortings.reduce(
    (obj: object, sorting: Sorting): object =>
      Object.assign(
        {
          [sorting.type.id]: sorting.order.toString(),
        },
        obj,
      ),
    {},
  );

  const returnedTypes = types.map((type: Type): string => type.id);

  let treeTypes;
  if (tree && tree.nodes && tree.nodes.length > 0) {
    treeTypes = tree.nodes.reduce(
      (newArr: Type[], node: Type): Type[] =>
        newArr.find((el: Type): boolean => el.id === node.id)
          ? newArr
          : newArr.concat([node]),
      [],
    );
  } else {
    treeTypes = tree && tree.root ? [tree.root] : [];
  }

  const treeNodes = treeTypes.map(
    (node: Type): Node => {
      const label =
        node.name +
        (Object.prototype.hasOwnProperty.call(sortingSelector, node.id)
          ? // eslint-disable-next-line
            // @ts-ignore
            ` *(${sortingSelector[node.id]})*`
          : '');

      const group = returnedTypes.indexOf(node.id) > -1 ? 'returnedTypes' : '';

      return { id: node.id, label, group };
    },
  );

  const treeEdges = tree.assns.map((assn: Assn): {
    from: string;
    to: string;
  } => ({
    from: assn.types[0].id,
    to: assn.types[1].id,
  }));

  const constraintNodes = constraints.map((constraint: Constraint): {
    id: string;
    label: string;
    group: string;
  } => ({
    id: constraint.id,
    label: constraint.value,
    group: 'constraints',
  }));

  const constraintEdges = constraints.map((constraint: Constraint): {
    from: string;
    to: string;
  } => ({
    from: constraint.id,
    to: constraint.type.id,
  }));

  const nodes = treeNodes.concat(constraintNodes);
  const edges = treeEdges.concat(constraintEdges);

  return { nodes, edges };
}

const options = {
  layout: {
    hierarchical: false,
  },
  height: '400px',
  nodes: {
    font: {
      size: 25,
      multi: 'markdown',
      color: '#6c6c6c',
      bold: {
        color: '#f51717',
        mod: '',
      },
    },
    shape: 'box',
  },
  edges: {
    arrows: {
      to: { enabled: false },
      middle: { enabled: false },
      from: { enabled: false },
    },
  },
  groups: {
    constraints: {
      title: 'constraint',
      font: {
        size: 20,
        color: '#ffffff',
      },
      color: {
        background: '#f55b5b',
        border: '#f51717',
        highlight: '#f51717',
      },
      physics: false,
    },
    returnedTypes: {
      title: 'returned types',
      font: {
        color: '#000000',
      },
    },
  },
};

interface SourceTypeTreeInterface {
  unit: Source;
}

const SourceTypeTree: React.FunctionComponent<SourceTypeTreeInterface> = ({
  unit: { tree, types, constraints, sortings },
}): JSX.Element | null => {
  if (!tree) {
    return null;
  }

  const graph = treeToGraph(tree, types, constraints, sortings);

  return <Graph graph={graph} options={options} />;
};

export default SourceTypeTree;
