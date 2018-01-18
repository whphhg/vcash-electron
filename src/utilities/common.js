import { homedir } from 'os'
import { join, sep } from 'path'

/**
 * A coin.
 * @name coin
 * @see {@link https://github.com/openvcash/vcash/blob/master/coin/include/coin/constants.hpp#L84|GitHub}
 */
export const coin = 1000000

/**
 * Get data folder path.
 * @function dataPath
 * @return {string} Data folder path.
 */
export const dataPath = () => {
  switch (process.platform) {
    case 'darwin':
      return join(homedir(), 'Library', 'Application Support', 'Vcash', sep)

    case 'win32':
      return join(homedir(), 'AppData', 'Roaming', 'Vcash', sep)

    default:
      return join(homedir(), '.Vcash', 'data', sep)
  }
}

/**
 * Debounce a function for a specified delay.
 * @function debounce
 * @param {function} callback - Function to be called upon execution.
 * @param {number} delay - Delay from last debounce until execution.
 * @return {function} Debounced function.
 * @see {@link https://remysharp.com/2010/07/21/throttling-function-calls|Blog}
 */
export const debounce = (callback, delay = 1000) => {
  let timer = null

  return () => {
    let context = this
    let args = arguments

    /** Clear previous timeout. */
    clearTimeout(timer)

    /** Set a new timeout and apply context and arguments to the function. */
    timer = setTimeout(() => callback.apply(context, args), delay)
  }
}

/**
 * Get decimal separator.
 * @function decimalSep
 * @return {string} Decimal separator.
 */
export const decimalSep = (n = 1.1) => {
  return n.toLocaleString().substring(1, 2)
}

/**
 * Get a human readable string.
 * @function humanReadable
 * @param {number} num - Number of bytes.
 * @param {string} dec - Decimal (true) or binary (false).
 * @param {string} suffix - Unit suffix.
 * @param {string} language - Local language.
 * @return {string} Human readable string.
 * @see {@link http://stackoverflow.com/a/14919494|StackOverflow}
 */
export const humanReadable = (num = 0, dec = true, suffix = 'B', language) => {
  const threshold = dec === true ? 1000 : 1024

  /** Return the number with suffix if below threshold. */
  if (Math.abs(num) < threshold) return ''.concat(num, ' ', suffix)

  let unit = -1
  const units =
    dec === true
      ? ['k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y']
      : ['Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei', 'Zi', 'Yi']

  do {
    num /= threshold
    unit++
  } while (Math.abs(num) >= threshold && unit < units.length - 1)

  num = new Intl.NumberFormat(language, {
    maximumFractionDigits: 2
  }).format(num)

  return ''.concat(num, ' ', units[unit], suffix)
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
  return ('0000' + ((Math.random() * 1679616) | 0).toString(36)).slice(-4)
}

/**
 * Get the CSS class of the color representing confirmation status.
 * @function statusColor
 * @param {number} conf - Transaction confirmations.
 * @param {string} cat - Transaction category.
 * @return {string} CSS classname.
 */
export const statusColor = (conf, cat) => {
  const rewards = ['incentiveReward', 'miningReward', 'stakingReward']

  if (rewards.includes(cat) === true) return conf < 220 ? 'orange' : 'green'
  return conf < 1 ? 'orange' : 'green'
}
