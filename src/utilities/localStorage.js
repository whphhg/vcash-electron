/**
 * Get item from local storage.
 * @function getItem
 * @param {string} key - Retrieve the value of this key.
 * @return {any} Stored value or undefined if the key doesn't exist.
 */
export const getItem = key => {
  const item = window.localStorage.getItem(key)

  if (item === null) {
    console.warn('LocalStorage: ' + key + ' has not been set yet.')
    return undefined
  } else {
    console.info('LocalStorage: ' + key)
    return JSON.parse(item)
  }
}

/**
 * Set item in local storage.
 * @function setItem
 * @param {string} key - Assign value to this key.
 * @param {any} value - Value to be stored.
 */
export const setItem = (key, value) => {
  window.localStorage.setItem(key, JSON.stringify(value))
}
