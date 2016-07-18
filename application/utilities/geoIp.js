import https from 'https'

const geoIp = (ip, callback) => {
  https.get('https://geoip.nekudo.com/api/' + ip, (response) => {
    if (response.headers['content-type'] === 'application/json') {
      let buffer = ''

      response.on('data', (data) => {
        buffer += data
      })

      response.on('end', () => {
        try {
          const geoData = JSON.parse(buffer)

          if (!geoData.hasOwnProperty('type')) {
            return callback(geoData)
          }

          callback(null)
        } catch (exception) {
          process.env.NODE_ENV === 'development' && console.error('HTTPS: Error parsing geoIp response.', exception)
          callback(null)
        }
      })
    }
  }).on('error', (error) => {
    process.env.NODE_ENV === 'development' && console.error('HTTPS: https://geoip.nekudo.com/api/'+ip+' error.', error)
    callback(null)
  })
}

export default geoIp
