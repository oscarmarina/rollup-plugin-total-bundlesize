import externals from 'rollup-plugin-node-externals';
import filesize from 'rollup-plugin-filesize';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

export default {
  input: 'src/index.js',
  onwarn(warning, rollupWarn) {
    if (!['CIRCULAR_DEPENDENCY', 'EVAL'].includes(warning.code)) {
      rollupWarn(warning);
    }
  },
  output: {
    dir: 'dist',
    format: 'cjs',
    sourcemap: true,
    exports: 'default',
  },
  external: [...Object.keys(pkg.dependencies)],
  plugins: [
    externals(),
    filesize({ showBrotliSize: true }),
    terser(),
  ],
};
