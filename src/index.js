/* eslint-disable no-unused-vars */
import boxen from 'boxen';
import filesize from 'rollup-plugin-filesize';
const colors = {
  reset: '\x1b[0m',
  yellowBright: '\x1b[93m',
  cyan: '\x1b[36m',
  blackBright: '\x1b[90m',
  green: '\x1b[32m',
};

export default (boxenOptions = {}) => {
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
    let [num, unit] = value.split(' ');
    switch (unit) {
      case 'B':
        return parseFloat(num);
      case 'KB':
        return parseFloat(num) * 1e3;
      case 'MB':
        return parseFloat(num) * 1e6;
      case 'GB':
        return parseFloat(num) * 1e9;
      default:
        return num;
    }
  };

  /**
   * @param {number} num
   * @returns {string}
   */
  const toReadableNumber = (num) => {
    return num.toLocaleString('en', { maximumFractionDigits: 2 });
  };

  /**
   * @param {number} value
   * @returns {string}
   */
  const getReadableSize = (value) => {
    let result;
    value = parseFloat(value);
    switch (true) {
      case value < 1e3:
        result = toReadableNumber(value) + ' B';
        break;
      case value >= 1e3 && value < 1e6:
        result = toReadableNumber(value / 1e3) + ' KB';
        break;
      case value >= 1e6 && value < 1e9:
        result = toReadableNumber(value / 1e6) + ' MB';
        break;
      case value >= 1e9 && value < 1e12:
        result = toReadableNumber(value / 1e6) + ' GB';
        break;
      default:
        result = String(value.toFixed());
    }
    return result;
  };

  let totalBundleSize = 0;
  let totalMinSize = 0;
  let totalGzipSize = 0;
  let totalBrotliSize = 0;

  return {
    name: 'rollup-plugin-total-bundlesize',
    generateBundle: async (...args) => {
      await filesize({
        showBrotliSize: true,
        reporter: (options, bundle, { fileName, bundleSize, minSize, gzipSize, brotliSize }) => {
          totalBundleSize += calculateByteSize(bundleSize);
          totalMinSize += calculateByteSize(minSize);
          totalGzipSize += calculateByteSize(gzipSize);
          totalBrotliSize += calculateByteSize(brotliSize);
        },
      }).generateBundle(...args);

      const output = `${colors.cyan}Bundle:${colors.reset}${colors.blackBright}${getReadableSize(
        totalBundleSize
      )}${colors.reset} | ${colors.cyan}Minified:${colors.reset}${
        colors.blackBright
      }${getReadableSize(totalMinSize)}${colors.reset} | ${colors.cyan}Gzipped:${
        colors.blackBright
      }${getReadableSize(totalGzipSize)}${colors.reset} | ${colors.cyan}Brotli:${colors.reset}${
        colors.blackBright
      }${getReadableSize(totalBrotliSize)}`;

      console.log('\n');
      console.log(boxen(`${colors.yellowBright}${output}${colors.reset}`, boxenOptionsDefault));
    },
  };
};
