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
      return homedir() + '\%APPDATA%\Vcash\data' + sep

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
  return entries * 25 < height
    ? entries * 25 + 27
    : height

}
