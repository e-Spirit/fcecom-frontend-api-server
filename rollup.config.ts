import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import ts from 'rollup-plugin-ts';
// @ts-ignore JSON is not correctly validated via TSLint
import { dependencies, main, module, peerDependencies } from './package.json';
import nodePolyfills from 'rollup-plugin-node-polyfills';

const extensions = ['.js', '.ts'];

export default [
  {
    input: 'src/index.ts',
    external: [...Object.keys(dependencies || {}), ...Object.keys(peerDependencies || {})],
    output: [
      {
        file: main,
        format: 'cjs',
      },
      {
        file: module,
        format: 'esm',
      },
    ],
    plugins: [
      ts(),
      json(),
      resolve({ extensions }),
      commonjs(),
      babel({
        extensions,
        include: ['src/**/*'],
        babelHelpers: 'bundled',
      }),
      terser(),
      nodePolyfills(),
    ],
  },
];
