# rollup-plugin-total-bundlesize

A Rollup plugin that displays the **total bundle size** across all outputs, including minified, gzipped, and brotli sizes. Complements Vite's built-in build summary.

## Installation

```bash
npm install @blockquote/rollup-plugin-total-bundlesize
```

## Usage

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
┌ Total size ──────────────────────────────────────────────────┐
│ Bundle:651 B | Minified:490 B | Gzipped:340 B | Brotli:351 B │
└──────────────────────────────────────────────────────────────┘
```

## Options

### `totalBundlesize(options?)`

| Option | Type | Default | Description |
|---|---|---|---|
| `showFileDetail` | `boolean` | `false` | Show individual file sizes before the total summary. |
| `...boxenOptions` | `object` | — | Any [boxen option](https://github.com/sindresorhus/boxen#options) to customize the output box. |

### Show individual file sizes

```js
totalBundlesize({ showFileDetail: true });
```

Output:

```
  bundle.es.js → 282 B (min: 206 B, gz: 157 B, br: 166 B)
  bundle.cjs.js → 369 B (min: 284 B, gz: 183 B, br: 185 B)

┌ Total size ──────────────────────────────────────────────────┐
│ Bundle:651 B | Minified:490 B | Gzipped:340 B | Brotli:351 B │
└──────────────────────────────────────────────────────────────┘
```

### Customize the box

```js
totalBundlesize({ title: 'Bundle report', borderStyle: 'double' });
```

## License

MIT
