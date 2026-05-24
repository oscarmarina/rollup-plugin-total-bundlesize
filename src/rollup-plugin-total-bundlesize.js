import boxen from 'boxen';
import { formatSize, measureChunk } from './calculate-bundle-sizes.js';

const c = {
  reset: '\x1b[0m',
  yellow: '\x1b[93m',
  cyan: '\x1b[36m',
  dim: '\x1b[90m',
  green: '\x1b[32m',
};

/**
 * @typedef {{ raw: number, min: number, gzip: number, brotli: number }} Sizes
 */

/**
 * Rollup / Vite plugin that prints the **total** bundle size across all chunks
 * at the end of every build.
 *
 * ### How sizes are measured
 *
 * The plugin receives each chunk in the `generateBundle` hook, which fires
 * **after** all other plugins (including Vite's / Rolldown's own minifier)
 * have already processed the code. Therefore:
 *
 * - **In Vite** (or Rollup + a minifier plugin): `chunk.code` is already
 *   minified when it arrives. `Bundle`, `Gzipped`, and `Brotli` all reflect
 *   the final minified output — the real numbers a server will compress and
 *   a browser will download.
 *
 * - **In plain Rollup without a minifier**: `chunk.code` is the raw,
 *   unminified output. Set `minify: true` to run terser and obtain a
 *   realistic estimate of what the code would look like in production.
 *
 * @param {{
 *   showFileDetail?: boolean,
 *   minify?: boolean
 * } & Partial<import('boxen').Options>} [options]
 *   Plugin options.
 *
 *   - `showFileDetail` (default `false`): print a per-file line
 *     (filename → size, gz, br) before the summary box.
 *
 *   - `minify` (default `false`): run terser on each chunk and add a
 *     **Minified** column. When enabled, `Gzipped` and `Brotli` are also
 *     measured against the minified output instead of the raw code.
 *     Leave `false` when using Vite or a Rollup minifier plugin — the code
 *     is already minified on arrival and running terser again is redundant
 *     (`Bundle ≈ Minified`). Set to `true` only for plain Rollup builds
 *     without a minifier, to estimate the production footprint.
 *
 *   - `...boxenOptions`: any [boxen](https://github.com/sindresorhus/boxen)
 *     option to customise the output box.
 */
export default ({ showFileDetail = false, minify = false, ...boxenOptions } = {}) => {
  const boxenOpts = /** @type {import('boxen').Options} */ ({
    padding: { top: 0, right: 1, bottom: 0, left: 1 },
    title: 'Total size',
    borderStyle: 'single',
    ...boxenOptions,
  });

  /** @type {Sizes} */
  let totals = { raw: 0, min: 0, gzip: 0, brotli: 0 };
  /** @type {Array<{ fileName: string, sizes: Sizes }>} */
  let files = [];

  return {
    name: 'rollup-plugin-total-bundlesize',
    apply: /** @type {const} */ ('build'),
    enforce: /** @type {const} */ ('post'),
    buildStart() {
      totals = { raw: 0, min: 0, gzip: 0, brotli: 0 };
      files = [];
    },
    async generateBundle(_outputOptions, bundle) {
      await Promise.all(
        Object.values(bundle)
          .filter((entry) => entry.type === 'chunk')
          .map(async (chunk) => {
            const sizes = await measureChunk(chunk.code, { minify });
            totals.raw += sizes.raw;
            totals.gzip += sizes.gzip;
            totals.brotli += sizes.brotli;
            if (sizes.min !== undefined) {
              totals.min += sizes.min;
            }
            if (showFileDetail) {
              files.push({
                fileName: chunk.fileName,
                sizes: { raw: sizes.raw, min: sizes.min ?? 0, gzip: sizes.gzip, brotli: sizes.brotli },
              });
            }
          }),
      );
    },
    closeBundle() {
      if (showFileDetail && files.length > 0) {
        console.log('');
        for (const { fileName, sizes } of files) {
          const detail = minify
            ? `(min: ${formatSize(sizes.min)}, gz: ${formatSize(sizes.gzip)}, br: ${formatSize(sizes.brotli)})`
            : `(gz: ${formatSize(sizes.gzip)}, br: ${formatSize(sizes.brotli)})`;
          console.log(`  ${c.green}${fileName}${c.reset} → ${formatSize(sizes.raw)} ${detail}`);
        }
      }

      const parts = [`${c.cyan}Bundle:${c.reset}${c.dim}${formatSize(totals.raw)}${c.reset}`];
      if (minify) {
        parts.push(`${c.cyan}Minified:${c.reset}${c.dim}${formatSize(totals.min)}${c.reset}`);
      }
      parts.push(`${c.cyan}Gzipped:${c.reset}${c.dim}${formatSize(totals.gzip)}${c.reset}`);
      parts.push(`${c.cyan}Brotli:${c.reset}${c.dim}${formatSize(totals.brotli)}${c.reset}`);
      const line = parts.join(' | ');

      console.log(c.reset);
      console.log(boxen(`${c.yellow}${line}${c.reset}`, boxenOpts));
    },
  };
};
