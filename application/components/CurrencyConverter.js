import React from 'react'
import { inject, observer } from 'mobx-react'
import TextField from 'material-ui/TextField'

@inject('currencyConverter')
@inject('rates')
@observer

class CurrencyConverter extends React.Component {
  constructor(props) {
    super(props)

    this.currencyConverter = props.currencyConverter
    this.rates = props.rates

    this.onChange = this.onChange.bind(this)
  }

  onChange(event) {
    const amount = event.target.value
    const convertFrom = event.target.id
    this.currencyConverter.setAmount(amount, convertFrom)
  }

  render() {
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
              onChange={this.onChange}
              value={this.currencyConverter.vcash}
            />
          </div>
          <div className='col-md-4'>
            <TextField
              id='local'
              fullWidth={true}
              hintText='Amount'
              floatingLabelStyle={{fontWeight:'normal'}}
              floatingLabelText={this.rates.localCurrency}
              onChange={this.onChange}
              value={this.currencyConverter.local}
            />
          </div>
          <div className='col-md-4'>
            <TextField
              id='bitcoin'
              fullWidth={true}
              hintText='Amount'
              floatingLabelStyle={{fontWeight:'normal'}}
              floatingLabelText='BTC'
              onChange={this.onChange}
              value={this.currencyConverter.bitcoin}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default CurrencyConverter
