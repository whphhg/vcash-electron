/**
 * Get item from local storage.
 * @function getItem
 * @param {string} key - Retrieve the value of this key.
 * @return {any} Stored key value or undefined if it doesn't exist.
 */
export const getItem = (key) => {
  const item = window.localStorage.getItem(key)

  if (item === null) {
    console.warn('LocalStorage: ' + key + ' not found.')
    return undefined
  } else {
    console.info('LocalStorage: Loaded ' + key + '.')
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
  window.localStorage.setItem(key, JSON.stringify(value))
}
