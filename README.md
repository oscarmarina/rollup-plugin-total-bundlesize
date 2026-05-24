# rollup-plugin-total-bundlesize

A Rollup / Vite plugin that displays the **total bundle size** across all chunks at the end of every build — including gzip and brotli sizes. Complements Vite's built-in per-file summary with an aggregated total.

## Installation

```bash
npm install @blockquote/rollup-plugin-total-bundlesize
```

## Usage

### Vite

```js
import totalBundlesize from '@blockquote/rollup-plugin-total-bundlesize';

export default {
  plugins: [totalBundlesize()],
};
```

### Rollup

```js
import totalBundlesize from '@blockquote/rollup-plugin-total-bundlesize';

export default {
  input: 'src/index.js',
  output: [
    { file: 'dist/bundle.es.js', format: 'es' },
    { file: 'dist/bundle.cjs.js', format: 'cjs' },
  ],
  plugins: [totalBundlesize()],
};
```

Output:

```
┌ Total size ──────────────────────────┐
│ Bundle:651 B | Gzipped:340 B | Brotli:298 B │
└──────────────────────────────────────┘
```

## How sizes are measured

The plugin measures each chunk inside the `generateBundle` hook, which runs **after** all other plugins have finished — including Vite's or Rolldown's built-in minifier.

| Context | `chunk.code` on arrival | What the plugin measures |
|---|---|---|
| **Vite** (esbuild / Rolldown) | already minified | real production size |
| **Rollup + minifier plugin** | already minified | real production size |
| **Plain Rollup, no minifier** | unminified | raw size — use `minify: true` for a production estimate |

## Options

### `totalBundlesize(options?)`

| Option | Type | Default | Description |
|---|---|---|---|
| `showFileDetail` | `boolean` | `false` | Print a per-file line before the summary box. |
| `minify` | `boolean` | `false` | Run terser and add a **Minified** column. See below. |
| `...boxenOptions` | `object` | — | Any [boxen option](https://github.com/sindresorhus/boxen#options) to customise the output box. |

### `minify`

Controls whether the plugin runs [terser](https://github.com/terser/terser) on each chunk and adds a **Minified** column to the output. When `true`, `Gzipped` and `Brotli` are measured against the minified output.

**Leave `false` (default) when using Vite or a Rollup minifier plugin.** The code is already minified by the time the plugin receives it, so running terser again is redundant — `Bundle ≈ Minified` and the column adds no useful information.

**Set to `true` for plain Rollup builds without a minifier** to get a realistic estimate of the production footprint:

```js
// Plain Rollup, no minifier — estimate production size
totalBundlesize({ minify: true });
```

Output with `minify: true`:

```
┌ Total size ──────────────────────────────────────────────────┐
│ Bundle:651 B | Minified:490 B | Gzipped:310 B | Brotli:275 B │
└──────────────────────────────────────────────────────────────┘
```

### `showFileDetail`

Print individual file sizes before the summary box:

```js
totalBundlesize({ showFileDetail: true });
```

Output (default, no `minify`):

```
  bundle.es.js → 282 B (gz: 157 B, br: 140 B)
  bundle.cjs.js → 369 B (gz: 183 B, br: 158 B)

┌ Total size ──────────────────────────┐
│ Bundle:651 B | Gzipped:340 B | Brotli:298 B │
└──────────────────────────────────────┘
```

Output with `showFileDetail: true` and `minify: true`:

```
  bundle.es.js → 282 B (min: 206 B, gz: 157 B, br: 140 B)
  bundle.cjs.js → 369 B (min: 284 B, gz: 183 B, br: 158 B)

┌ Total size ──────────────────────────────────────────────────┐
│ Bundle:651 B | Minified:490 B | Gzipped:340 B | Brotli:298 B │
└──────────────────────────────────────────────────────────────┘
```

### Customise the box

Any [boxen](https://github.com/sindresorhus/boxen#options) option is accepted:

```js
totalBundlesize({ title: 'Bundle report', borderStyle: 'double' });
```

## License

MIT
