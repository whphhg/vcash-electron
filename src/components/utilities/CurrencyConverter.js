import React from 'react'
import { translate } from 'react-i18next'
import { action, computed, extendObservable } from 'mobx'
import { inject, observer } from 'mobx-react'
import { decimalSep } from '../../utilities/common.js'

/** Ant Design */
import Input from 'antd/lib/input'

@translate(['common'])
@inject('gui', 'rates')
@observer
class CurrencyConverter extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.rates = props.rates

    /** Extend the component with observable properties. */
    extendObservable(this, { amount: 1, from: 'vcash' })
  }

  /**
   * Get converted amounts.
   * @function amounts
   * @return {object} Converted amounts.
   */
  @computed
  get amounts() {
    const { average, local } = this.rates

    switch (this.from) {
      case 'bitcoin':
        return {
          bitcoin: this.amount,
          local: Math.round(this.amount * local * 1e3) / 1e3,
          vcash: Math.round(this.amount / average * 1e6) / 1e6
        }

      case 'local':
        return {
          bitcoin: Math.round(this.amount / local * 1e8) / 1e8,
          local: this.amount,
          vcash: Math.round(this.amount / local / average * 1e6) / 1e6
        }

      case 'vcash':
        return {
          bitcoin: Math.round(this.amount * average * 1e8) / 1e8,
          local: Math.round(this.amount * local * average * 1e3) / 1e3,
          vcash: this.amount
        }
    }
  }

  /**
   * Set amount and converting currency.
   * @function convert
   * @param {object} e - Input element event.
   */
  @action
  convert = e => {
    const amount = e.target.value
    const from = e.target.name

    /** Allow only amount in 0000000[.,]00000000 format. */
    switch (decimalSep()) {
      case '.':
        if (amount.match(/^\d{0,7}(?:\.\d{0,8})?$/) === null) return
        break

      case ',':
        if (amount.match(/^\d{0,7}(?:,\d{0,8})?$/) === null) return
        break
    }

    this.amount = amount
    this.from = from
  }

  render() {
    return (
      <div>
        <div className="flex" style={{ margin: '0 0 10px 0' }}>
          <i className="material-icons md-16">cached</i>
          <p>{this.t('currencyConverter')}</p>
        </div>
        <div className="flex-sb">
          <div style={{ flex: '1' }}>
            <Input
              addonBefore="XVC"
              name="vcash"
              onChange={this.convert}
              placeholder={this.t('amount')}
              size="small"
              value={this.amounts.vcash}
            />
          </div>
          <div style={{ flex: 1, margin: '0 5px 0 5px' }}>
            <Input
              addonBefore="BTC"
              name="bitcoin"
              onChange={this.convert}
              placeholder={this.t('amount')}
              size="small"
              value={this.amounts.bitcoin}
            />
          </div>
          <div style={{ flex: '1' }}>
            <Input
              addonBefore={this.gui.localCurrency}
              name="local"
              onChange={this.convert}
              placeholder={this.t('amount')}
              size="small"
              value={this.amounts.local}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default CurrencyConverter
