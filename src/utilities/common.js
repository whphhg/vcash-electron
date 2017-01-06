import { homedir } from 'os'
import { sep } from 'path'

/**
 * Get decimal separator.
 * @function decimalSeparator
 * @return {string} Decimal separator.
 */
export const decimalSeparator = () => {
  const n = 1.1
  return n.toLocaleString().substring(1, 2)
}

/**
 * Get data folder path.
 * @function dataPath
 * @return {string} Data folder path.
 */
export const dataPath = () => {
  switch (process.platform) {
    case 'darwin':
      return homedir() + '/Library/Application Support/Vcash/data' + sep

    case 'win32':
      return homedir() + '/%APPDATA%/Vcash/data' + sep

    default:
      return homedir() + '/.Vcash/data' + sep
  }
}

/**
 * Calculate fixed-data-table height.
 * @function tableHeight
 * @param {number} entries - Number of entries in array.
 * @param {number} height - Height of the table.
 * @return {number} Table height.
 */
export const tableHeight = (entries = 0, height = 0) => {
  return entries * 25 + 27 < height
    ? entries * 25 + 27
    : height
}

/**
 * Get a 4-character alphanumeric unique sequence.
 * For N unique IDs, out of X possibilities,
 * call at most 1 / (1 − N / X) times on average to ensure uniqueness.
 * @function shortUid
 * @return {string} Unique 4-character uid.
 * @see {@link http://stackoverflow.com/a/6248722|StackOverflow}
 */
export const shortUid = () => {
  return (
    '0000' + (Math.random() * Math.pow(36, 4) << 0).toString(36)
  ).slice(-4)
}
