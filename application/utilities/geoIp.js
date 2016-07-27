/**
 * Get IP geo data.
 * @function geoIp
 * @param {string} ip - IP address to lookup.
 * @param {function} callback - Callback function to be fired.
 * @return {object|null} Provided IP geo data or null.
 */
const geoIp = (ip, callback) => {
  fetch('https://geoip.nekudo.com/api/' + ip)
    .then((response) => { if (response.ok) return response.json() })
    .then((data) => {
      if (!data.hasOwnProperty('type')) {
        return callback(data)
      }

      return callback(null)
    })
    .catch((error) => {
      process.env.NODE_ENV === 'dev' && console.error('https://geoip.nekudo.com/api/' + ip, error.message)
      return callback(null)
    })
}

export default geoIp
