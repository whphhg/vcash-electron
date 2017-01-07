import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Select } from 'antd'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('rates') @observer

class SelectCurrency extends React.Component {
  constructor (props) {
    super(props)
    this.rates = props.rates
    this.t = props.t
    this.setLocalCurrency = this.setLocalCurrency.bind(this)
  }

  setLocalCurrency (value) {
    this.rates.setLocalCurrency(value)
  }

  render () {
    /** Destructure properties. */
    const {
      localCurrency,
      localCurrencies
    } = this.rates

    const {
      Option
    } = Select

    return (
      <Select
        showSearch
        style={{width: '80px'}}
        defaultValue={localCurrency}
        optionFilterProp='children'
        notFoundContent={this.t('wallet:notFound')}
        onChange={this.setLocalCurrency}
      >
        {
          localCurrencies.map((currency) => (
            <Option
              key={currency}
              value={currency}
            >
              {currency}
            </Option>
          ))
        }
      </Select>
    )
  }
}

export default SelectCurrency
