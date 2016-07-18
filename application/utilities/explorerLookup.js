import https from 'https'

const explorerLookup = (address, callback) => {
  https.get('https://explorer.v.cash/ext/getaddress/' + address, (response) => {
    if (response.headers['content-type'] === 'application/json') {
      let buffer = ''

      response.on('data', (data) => {
        buffer += data
      })

      response.on('end', () => {
        try {
          const data = JSON.parse(buffer)

          if (!data.hasOwnProperty('error')) {
            return callback(data)
          }

          callback(null)
        } catch (exception) {
          process.env.NODE_ENV === 'development' && console.error('HTTPS: Error parsing explorerLookup response.', exception)
          callback(null)
        }
      })
    }
  }).on('error', (error) => {
    process.env.NODE_ENV === 'development' && console.error('HTTPS: https://explorer.v.cash/ext/getaddress/'+addressp+' error.', error)
    callback(null)
  })
}

export default explorerLookup
