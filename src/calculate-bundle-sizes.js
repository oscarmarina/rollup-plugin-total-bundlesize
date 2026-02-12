import { gzipSync, brotliCompressSync } from "node:zlib";
import { minify } from "terser";

/**
 * @param {number} num
 * @returns {string}
 */
const toReadableNumber = (num) => {
  return num.toLocaleString('en', {maximumFractionDigits: 2});
};

/**
 * Formats a byte value into a human-readable string (e.g. "1.5 KB").
 * Uses JEDEC standard units (KB, MB, GB, TB).
 * @param {number} value - Size in bytes
 * @returns {string}
 */
export const formatSize = (value) => {
  switch (true) {
    case value < 1e3:
      return toReadableNumber(value) + ' B';
    case value >= 1e3 && value < 1e6:
      return toReadableNumber(value / 1e3) + ' KB';
    case value >= 1e6 && value < 1e9:
      return toReadableNumber(value / 1e6) + ' MB';
    case value >= 1e9 && value < 1e12:
      return toReadableNumber(value / 1e9) + ' GB';
    case value >= 1e12:
      return toReadableNumber(value / 1e12) + ' TB';
    default:
      return toReadableNumber(value) + ' B';
  }
};

export default function calculateBundleSizes(options = {}) {
  const {
    showGzippedSize = true,
    showBrotliSize = false,
    showMinifiedSize = true,
    reporter,
  } = options;

  const getLoggingData = async function (outputOptions, bundle) {
    const { code, fileName } = bundle;
    const info = { fileName };

    info.bundleSize = formatSize(Buffer.byteLength(code));

    info.brotliSize = showBrotliSize
      ? formatSize(brotliCompressSync(code).length)
      : "";

    if (showMinifiedSize || showGzippedSize) {
      const minifiedCode = (await minify(code)).code ?? code;
      info.minSize = showMinifiedSize
        ? formatSize(minifiedCode.length)
        : "";
      info.gzipSize = showGzippedSize
        ? formatSize(gzipSync(minifiedCode).length)
        : "";
    }
    if (reporter) {
      reporter(
        { showGzippedSize, showBrotliSize, showMinifiedSize },
        outputOptions,
        info
      );
    }
  };

  return {
    name: "calculateBundleSizes",
    async generateBundle(outputOptions, bundle) {
      await Promise.all(
        Object.values(bundle)
          .filter((currentBundle) =>
            currentBundle.type ? currentBundle.type !== "asset" : !currentBundle.isAsset
          )
          .map((currentBundle) => getLoggingData(outputOptions, currentBundle))
      );
    },
  };
}
