/**
 * Explorer API getaddress.
 * @function getAddress
 * @param {string} address - Address to lookup.
 * @param {function} callback - Function to call with response.
 * @return {callback} Callback with response object or null.
 * @see {@link https://explorer.v.cash/info|Explorer API}
 */
export const getAddress = (address, callback) => {
  fetch('https://explorer.v.cash/ext/getaddress/' + address)
    .then((response) => { if (response.ok) return response.json() })
    .then((data) => {
      if (!data.hasOwnProperty('error')) {
        return callback(data)
      }

      return callback(null)
    })
    .catch((error) => {
      process.env.NODE_ENV === 'dev' && console.error('https://explorer.v.cash/ext/getaddress/' + address, error.message)
      return callback(null)
    })
}
