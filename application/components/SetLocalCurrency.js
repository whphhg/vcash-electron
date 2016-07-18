import React from 'react'
import { render } from 'react-dom'
import MenuItem from 'material-ui/MenuItem'
import SelectField from 'material-ui/SelectField'

const SetLocalCurrency = ({ localCurrencies, localCurrency, setLocalCurrency }) => {
  const onChange = (event, index, value) => {
    setLocalCurrency(value)
  }

  return (
    <div>
      <SelectField
        autoWidth={true}
        style={{width:'150px'}}
        value={localCurrency}
        onChange={onChange}
        floatingLabelText='Set local currency'
      >
        {
          localCurrencies.map((currency) => (
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

export default SetLocalCurrency
