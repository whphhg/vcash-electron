import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Select } from 'antd'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('gui', 'rates') @observer

export default class SelectCurrency extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.rates = props.rates
  }

  /**
   * Set local currency.
   * @function setLocalCurrency
   * @param {string} currency - Local currency.
   */
  setLocalCurrency = (currency) => {
    this.gui.setLocalCurrency(currency)
  }

  render () {
    return (
      <Select
        defaultValue={this.gui.localCurrency}
        notFoundContent={this.t('wallet:notFound')}
        onChange={this.setLocalCurrency}
        optionFilterProp='children'
        showSearch
        size='small'
        style={{width: '80px'}}
      >
        {
          this.rates.localCurrencies.map((currency) => (
            <Select.Option key={currency} value={currency}>
              {currency}
            </Select.Option>
          ))
        }
      </Select>
    )
  }
}
