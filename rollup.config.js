import externals from "rollup-plugin-node-externals";
import terser from "@rollup/plugin-terser";

export default {
  input: "src/rollupPluginTotalBundlesize.js",
  // @ts-ignore
  onwarn(warning, rollupWarn) {
    if (!['CIRCULAR_DEPENDENCY', 'EVAL'].includes(warning.code)) {
      rollupWarn(warning);
    }
  },
  output: [
    {
      file: "dist/rollup-plugin-total-bundlesize.js",
      format: "es",
      sourcemap: true,
    },
    {
      file: "dist/cjs/rollup-plugin-total-bundlesize.cjs",
      format: "cjs",
      sourcemap: true,
    },
  ],
  plugins: [externals(), terser()],
};
