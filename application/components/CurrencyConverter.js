import React from 'react'
import TextField from 'material-ui/TextField'

const CurrencyConverter = ({ inBitcoin, inLocal, inVcash, localCurrency, currencyConverter }) => {
  process.env.NODE_ENV === 'development' && console.log('%c' + '<CurrencyConverter />', 'color:#673AB7')
  return (
    <div className='container-fluid'>
      <div className='row' style={{marginTop:'10px'}}>
        <div className='col-md-12'>
          <h4 style={{marginBottom:'0px'}}>Convert currencies</h4>
        </div>
      </div>
      <div className='row'>
        <div className='col-md-4'>
          <TextField
            id='vcash'
            fullWidth={true}
            hintText='Amount'
            floatingLabelStyle={{fontWeight:'normal'}}
            floatingLabelText='XVC'
            onChange={currencyConverter}
            value={inVcash}
          />
        </div>
        <div className='col-md-4'>
          <TextField
            id='local'
            fullWidth={true}
            hintText='Amount'
            floatingLabelStyle={{fontWeight:'normal'}}
            floatingLabelText={localCurrency}
            onChange={currencyConverter}
            value={inLocal}
          />
        </div>
        <div className='col-md-4'>
          <TextField
            id='bitcoin'
            fullWidth={true}
            hintText='Amount'
            floatingLabelStyle={{fontWeight:'normal'}}
            floatingLabelText='BTC'
            onChange={currencyConverter}
            value={inBitcoin}
          />
        </div>
      </div>
    </div>
  )
}

export default CurrencyConverter
