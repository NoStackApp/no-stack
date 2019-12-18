export interface Type {
  id: string;
  name: string;
}

export interface Sorting {
  id: string;
  order: number;
  type: Type;
}

export interface Constraint {
  id: string;
  value: string;
  type: Type;
}

export interface Assn {
  id: string;
  name: string;
  types: Type[];
}

export interface Tree {
  id: string;
  name: string;
  root: Type;
  assns: Assn[];
  nodes: Type[];
}

export interface Source {
  id: string;
  name: string;
  sortings: Sorting[];
  types: Type[];
  constraints: Constraint[];
  tree: Tree;
}
