import React from 'react';
import Graph from 'react-graph-vis';

function treeToGraph(tree, types, constraints, sortings) {
  const sortingSelector = sortings.reduce(
    (obj, sorting) =>
      Object.assign(
        {
          [sorting.type.id]: sorting.order.toString(),
        },
        obj,
      ),
    {},
  );

  const returnedTypes = types.map(type => type.id);

  const treeNodes = (tree.nodes && tree.nodes.length > 0
    ? tree.nodes.reduce(
        (newArr, node) =>
          newArr.find(el => el.id === node.id) ? newArr : newArr.concat([node]),
        [],
      )
    : [tree.root]
  ).map(node => {
    const label =
      node.name +
      (Object.prototype.hasOwnProperty.call(sortingSelector, node.id)
        ? ` *(${sortingSelector[node.id]})*`
        : '');

    const group = returnedTypes.indexOf(node.id) > -1 ? 'returnedTypes' : '';

    return { id: node.id, label, group };
  });

  const treeEdges = tree.assns.map(assn => ({
    from: assn.types[0].id,
    to: assn.types[1].id,
  }));

  const constraintNodes = constraints.map(constraint => ({
    id: constraint.id,
    label: constraint.value,
    group: 'constraints',
  }));

  const constraintEdges = constraints.map(constraint => ({
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

const SourceTypeTree = ({ source: { tree, types, constraints, sortings } }) => {
  if (!tree) {
    return null;
  }

  const graph = treeToGraph(tree, types, constraints, sortings);

  return <Graph graph={graph} options={options} />;
};

export default SourceTypeTree;
