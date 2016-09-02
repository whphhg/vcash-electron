/**
 * Get IP geodata.
 * @function geoIp
 * @param {string} ip - IP address to lookup.
 * @param {function} callback - Function to call with response.
 * @return {callback} Callback with response object or null.
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
