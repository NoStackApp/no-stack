import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import babelRuntimeExternal from 'rollup-plugin-babel-runtime-external';
import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import visualizer from 'rollup-plugin-visualizer';
import { getTransformer } from 'ts-transform-graphql-tag';
import graphql from 'rollup-plugin-graphql';

import pkg from './package.json';

const isProd = process.env.NODE_ENV === 'production';
const isWatch = process.env.NODE_ENV === 'watch';

const graphQLTransformer = () => ({
  before: [getTransformer()],
});

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

const plugins = [
  resolve({
    browser: true,
    dedupe: external,
    customResolveOptions: {
      moduleDirectory: 'src',
    },
  }),
  typescript({
    objectHashIgnoreUnknownHack: false,
    clean: true, // enable once in a while
    transformers: [graphQLTransformer],
  }),
  graphql(),
  babel({
    exclude: 'node_modules/**',
    runtimeHelpers: true,
    extensions: ['.ts', '.tsx', '.js'],
  }),
  babelRuntimeExternal(),
  commonjs(),
  isProd && terser(),
  !isWatch &&
    !isProd &&
    visualizer({
      template: 'circlepacking',
      filename: 'stats/index.html',
      open: true,
    }),
];

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/no-stack.cjs.js',
      format: 'commonjs',
      name: 'NoStack',
      esModule: false,
      sourceMap: isProd ? false : 'inline',
    },
    external,
    plugins,
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/no-stack.esm.js',
      format: 'esm',
      sourceMap: isProd ? false : 'inline',
    },
    external,
    plugins,
  },
];
