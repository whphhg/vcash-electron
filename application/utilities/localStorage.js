/**
 * Get item from local storage.
 * @function getItem
 * @param {key} key - Item key to return.
 * @return {string|number|array|object|null} Stored item or null.
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
 * @param {string} key - Item key.
 * @param {string} value - Item value.
 */
export const setItem = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}
