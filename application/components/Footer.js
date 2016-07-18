import React from 'react'
import Paper from 'material-ui/Paper'

const Footer = ({ bittrexLast, exchangeRate, localCurrency, localRate, poloniexLast }) => {
  process.env.NODE_ENV === 'development' && console.log('%c' + '<Footer />', 'color:#673AB7')
  return (
    <div>
      <Paper className='footer'>
        <div>
          <img src='./assets/images/exchangePoloniex.png' style={{marginTop:'-2px'}} />
          <span style={{paddingLeft:'4px'}}>{parseFloat(poloniexLast).toFixed(8)} BTC</span>
          <img src='./assets/images/exchangeBittrex.png' style={{paddingLeft:'15px', marginTop:'-2px'}} />
          <span style={{paddingLeft:'4px'}}>{parseFloat(bittrexLast).toFixed(8)} BTC</span>
        </div>
      </Paper>
    </div>
  )
}

export default Footer
