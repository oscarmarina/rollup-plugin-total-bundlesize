import { gzipSync, brotliCompressSync } from 'node:zlib';
import { minify } from 'terser';

/**
 * @param {number} num
 * @returns {string}
 */
const toReadableNumber = (num) => num.toLocaleString('en', { maximumFractionDigits: 2 });

/**
 * Formats a byte value into a human-readable string (e.g. "1.5 KB").
 * Uses JEDEC standard units (KB, MB, GB, TB).
 * @param {number} value - Size in bytes
 * @returns {string}
 */
export const formatSize = (value) => {
  if (value < 1e3) {
    return `${toReadableNumber(value)} B`;
  }
  if (value < 1e6) {
    return `${toReadableNumber(value / 1e3)} KB`;
  }
  if (value < 1e9) {
    return `${toReadableNumber(value / 1e6)} MB`;
  }
  if (value < 1e12) {
    return `${toReadableNumber(value / 1e9)} GB`;
  }
  return `${toReadableNumber(value / 1e12)} TB`;
};

/**
 * Measure raw, gzip, and brotli sizes (in bytes) for a chunk's code.
 * Accepts a string or Uint8Array — Rolldown (Vite 8+) may emit either.
 *
 * By default gzip and brotli are measured on the code **as it arrives** —
 * which is what a server actually compresses in production (Vite, or Rollup
 * with a minifier plugin, will have already minified by the time this hook
 * runs).
 *
 * Pass `{ minify: true }` to also run terser as a "what would the minified
 * version look like" estimate; in that case `min` is populated and gzip /
 * brotli are measured against the minified output. Useful for pure-Rollup
 * library builds that don't run a minifier.
 *
 * @param {string | Uint8Array} code
 * @param {{ minify?: boolean }} [options]
 * @returns {Promise<{ raw: number, gzip: number, brotli: number, min?: number }>}
 */
export const measureChunk = async (code, { minify: shouldMinify = false } = {}) => {
  const text = typeof code === 'string' ? code : Buffer.from(code).toString('utf8');
  const raw = Buffer.byteLength(text);

  if (!shouldMinify) {
    return {
      raw,
      gzip: gzipSync(text).length,
      brotli: brotliCompressSync(text).length,
    };
  }

  const minified = (await minify(text)).code ?? text;
  return {
    raw,
    min: Buffer.byteLength(minified),
    gzip: gzipSync(minified).length,
    brotli: brotliCompressSync(minified).length,
  };
};
