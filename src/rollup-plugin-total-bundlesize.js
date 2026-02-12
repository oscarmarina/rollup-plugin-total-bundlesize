import boxen from 'boxen';
import calculateBundleSizes, { formatSize } from './calculate-bundle-sizes.js';

const colors = {
  reset: '\x1b[0m',
  yellowBright: '\x1b[93m',
  cyan: '\x1b[36m',
  blackBright: '\x1b[90m',
  green: '\x1b[32m',
};
export default ({ showFileDetail = false, ...boxenOptions } = {}) => {
  const boxenOptionsDefault = {
    padding: {
      top: 0,
      right: 1,
      bottom: 0,
      left: 1,
    },
    title: 'Total size',
    borderStyle: 'single',
    ...boxenOptions,
  };

  /**
   * @param {string} value
   * @returns {number}
   */
  const calculateByteSize = (value) => {
    let [numStr, unit] = value.split(' ');
    const num = parseFloat(numStr);
    switch (unit) {
      case 'B':
        return num;
      case 'KB':
        return num * 1e3;
      case 'MB':
        return num * 1e6;
      case 'GB':
        return num * 1e9;
      default:
        return num;
    }
  };

  let totalBundleSize = 0;
  let totalMinSize = 0;
  let totalGzipSize = 0;
  let totalBrotliSize = 0;

  /** @type {Array<{fileName: string, bundleSize: string, minSize: string, gzipSize: string, brotliSize: string}>} */
  const fileDetails = [];

  return {
    name: 'rollup-plugin-total-bundlesize',
    apply: /** @type {const} */ ('build'),
    generateBundle: async (...args) => {
      await calculateBundleSizes({
        showBrotliSize: true,
        reporter: (options, bundle, { fileName, bundleSize, minSize, gzipSize, brotliSize }) => {
          totalBundleSize += calculateByteSize(bundleSize);
          totalMinSize += calculateByteSize(minSize);
          totalGzipSize += calculateByteSize(gzipSize);
          totalBrotliSize += calculateByteSize(brotliSize);
          if (showFileDetail) {
            fileDetails.push({ fileName, bundleSize, minSize, gzipSize, brotliSize });
          }
        },
      }).generateBundle(...args);
    },
    closeBundle() {
      if (showFileDetail) {
        console.log('');
        for (const f of fileDetails) {
          console.log(
            `  ${colors.green}${f.fileName}${colors.reset} → ${f.bundleSize} (min: ${f.minSize}, gz: ${f.gzipSize}, br: ${f.brotliSize})`,
          );
        }
      }

      const output = `${colors.cyan}Bundle:${colors.reset}${colors.blackBright}${formatSize(
        totalBundleSize,
      )}${colors.reset} | ${colors.cyan}Minified:${colors.reset}${
        colors.blackBright
      }${formatSize(totalMinSize)}${colors.reset} | ${colors.cyan}Gzipped:${
        colors.blackBright
      }${formatSize(totalGzipSize)}${colors.reset} | ${colors.cyan}Brotli:${colors.reset}${
        colors.blackBright
      }${formatSize(totalBrotliSize)}`;

      console.log(colors.reset);
      // @ts-ignore
      console.log(boxen(`${colors.yellowBright}${output}${colors.reset}`, boxenOptionsDefault));
    },
  };
};
