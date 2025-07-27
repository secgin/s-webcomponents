import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/s-webcomponents.umd.js',
      format: 'umd',
      name: 'SWebComponents',
      globals: {},
    },
    {
      file: 'dist/s-webcomponents.umd.min.js',
      format: 'umd',
      name: 'SWebComponents',
      plugins: [terser()],
      globals: {},
    },
    {
      file: 'dist/s-webcomponents.esm.js',
      format: 'es',
    }
  ],
  plugins: [
    resolve(),
    commonjs(),
  ],
};
