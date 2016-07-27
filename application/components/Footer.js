import React from 'react'
import { inject, observer } from 'mobx-react'
import Paper from 'material-ui/Paper'

@inject('rates')
@inject('wallet')
@observer

class Footer extends React.Component {
  constructor(props) {
    super(props)
    this.rates = props.rates
    this.wallet = props.wallet
  }

  render() {
    return (
      <Paper className='footer'>
        <div style={{float:'left'}}>
          <img src='./assets/images/exchangePoloniex.png' style={{marginTop:'-2px'}} />
          <span style={{paddingLeft:'4px'}}><span className='font-weight-500'>{parseFloat(this.rates.poloniex.last).toFixed(8)}</span> BTC</span>
          <img src='./assets/images/exchangeBittrex.png' style={{paddingLeft:'15px', marginTop:'-2px'}} />
          <span style={{paddingLeft:'4px'}}><span className='font-weight-500'>{parseFloat(this.rates.bittrex.Last).toFixed(8)}</span> BTC</span>
        </div>
        <div style={{float:'right', paddingRight:'15px'}}>
          <p className='text-muted'>
            Vcash <span className='font-weight-500'>{this.wallet.version}</span> &nbsp;
            Wallet <span className='font-weight-500'>{this.wallet.walletversion}</span> &nbsp;
            UI <span className='font-weight-500'>{process.env.npm_package_version}</span>
          </p>
        </div>
        <div style={{clear:'both'}}></div>
      </Paper>
    )
  }
}

export default Footer
