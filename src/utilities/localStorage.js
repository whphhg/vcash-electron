/**
 * Get item from local storage.
 * @function getItem
 * @param {string} key - Retrieve the value of this key.
 * @return {string|number|array|object|undefined} Stored key's value or undefined if it doesn't exist.
 */
export const getItem = (key) => {
  const item = localStorage.getItem(key)

  if (item === null) {
    process.env.NODE_ENV === 'dev' && console.warn('LocalStorage: ' + key + ' not found.')
    return undefined
  } else {
    process.env.NODE_ENV === 'dev' && console.info('LocalStorage: Loaded ' + key + '.')
    return JSON.parse(item)
  }
}

/**
 * Set item in local storage.
 * @function setItem
 * @param {string} key - Assign value to this key.
 * @param {string|number|array|object} value - Value to be stored.
 */
export const setItem = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}
