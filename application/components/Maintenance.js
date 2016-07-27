import React from 'react'
import { inject, observer } from 'mobx-react'
import MenuItem from 'material-ui/MenuItem'
import SelectField from 'material-ui/SelectField'

@inject('rates')
@observer

class Maintenance extends React.Component {
  constructor(props) {
    super(props)
    this.rates = props.rates
    this.setLocalCurrency = this.setLocalCurrency.bind(this)
  }

  setLocalCurrency(event, index, value) {
    this.rates.setLocalCurrency(value)
  }

  render() {
    return (
      <div>
        <h5>Maintenance</h5>
        <SelectField
          autoWidth={true}
          style={{width:'150px'}}
          value={this.rates.localCurrency}
          onChange={this.setLocalCurrency}
          floatingLabelText='Set local currency'
        >
          {
            this.rates.localCurrencies.map((currency) => (
              <MenuItem
                key={currency}
                value={currency}
                primaryText={currency}
              />
            ))
          }
        </SelectField>
      </div>
    )
  }
}

export default Maintenance
