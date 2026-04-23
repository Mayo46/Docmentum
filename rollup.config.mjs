import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [
    peerDepsExternal(),
    resolve(),
    json(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      compilerOptions: {
        noEmit: false,
        allowImportingTsExtensions: false,
        outDir: './dist',
        declaration: true,
        declarationDir: './dist'
      }
    }),
    postcss({
      modules: false,
      extract: true,
      minimize: true,
    }),
    terser(),
  ],
};
