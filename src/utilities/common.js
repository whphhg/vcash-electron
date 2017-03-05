import { homedir } from 'os'
import { sep } from 'path'

/** Required store instances. */
import ui from '../stores/ui'

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

/**
 * Get a human readable string.
 * @function humanReadable
 * @param {number} num - Number of bytes.
 * @param {string} dec - Decimal (true) or binary (false).
 * @param {string} suffix - Unit suffix.
 * @return {string} Human readable string.
 * @see {@link http://stackoverflow.com/a/14919494|StackOverflow}
 */
export const humanReadable = (num = 0, dec = true, suffix = 'B') => {
  const threshold = dec === true
    ? 1000
    : 1024

  const units = dec === true
    ? ['k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y']
    : ['Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei', 'Zi', 'Yi']

  if (Math.abs(num) < threshold) {
    return num + ' ' + suffix
  }

  let unit = -1

  do {
    num /= threshold
    unit++
  } while (
    Math.abs(num) >= threshold &&
    unit < units.length - 1
  )

  return new Intl.NumberFormat(ui.language, {
    maximumFractionDigits: 2
  }).format(num) + ' ' + units[unit] + suffix
}
