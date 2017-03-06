import React from 'react'
import { translate } from 'react-i18next'
import { action, computed, observable } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Col, Input, Row } from 'antd'
import { decimalSeparator } from '../utilities/common'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('rates', 'ui') @observer

export default class CurrencyConverter extends React.Component {
  @observable amount
  @observable from

  constructor (props) {
    super(props)
    this.t = props.t

    /** Observable properties. */
    this.amount = 1
    this.from = 'vcash'

    /** Injected stores. */
    this.rates = props.rates
    this.ui = props.ui
  }

  /**
   * Get converted amounts.
   * @function amounts
   * @return {object} Converted amounts.
   */
  @computed get amounts () {
    const { average, local } = this.rates

    switch (this.from) {
      case 'bitcoin':
        return {
          bitcoin: this.amount,
          local: Math.round((this.amount * local) * 1e3) / 1e3,
          vcash: Math.round((this.amount / average) * 1e6) / 1e6
        }

      case 'local':
        return {
          bitcoin: Math.round((this.amount / local) * 1e8) / 1e8,
          local: this.amount,
          vcash: Math.round(((this.amount / local) / average) * 1e6) / 1e6
        }

      case 'vcash':
        return {
          bitcoin: Math.round((this.amount * average) * 1e8) / 1e8,
          local: Math.round((this.amount * local * average) * 1e3) / 1e3,
          vcash: this.amount
        }
    }
  }

  /**
   * Set amount and converting currency.
   * @function convert
   * @param {object} e - Input element event.
   */
  @action convert = (e) => {
    const amount = e.target.value
    const from = e.target.name

    /** Allow only amount in 0000000[.,]000000 format. */
    switch (decimalSeparator()) {
      case '.':
        if (amount.match(/^\d{0,7}(?:\.\d{0,6})?$/) === null) return
        break

      case ',':
        if (amount.match(/^\d{0,7}(?:,\d{0,6})?$/) === null) return
        break
    }

    this.amount = amount
    this.from = from
  }

  render () {
    return (
      <div>
        <Row>
          <Col span={12}>
            {this.t('wallet:currencyConverter')}
          </Col>
          <Col span={1} offset={1}>
            <Col span={18} offset={6}>
              <img
                src='./assets/images/exchangePoloniex.png'
                style={{margin: '1px 0 0 0'}}
              />
            </Col>
          </Col>
          <Col span={4} style={{textAlign: 'right'}}>
            <span style={{fontWeight: '500'}}>
              {
                new Intl.NumberFormat(this.ui.language, {
                  minimumFractionDigits: 8,
                  maximumFractionDigits: 8
                }).format(this.rates.poloniex.last)
              }
            </span> BTC
          </Col>
          <Col span={1} offset={1}>
            <Col span={18} offset={6}>
              <img
                src='./assets/images/exchangeBittrex.png'
                style={{margin: '1px 0 0 0'}}
              />
            </Col>
          </Col>
          <Col span={4} style={{textAlign: 'right'}}>
            <span style={{fontWeight: '500'}}>
              {
                new Intl.NumberFormat(this.ui.language, {
                  minimumFractionDigits: 8,
                  maximumFractionDigits: 8
                }).format(this.rates.bittrex.Last)
              }
            </span> BTC
          </Col>
        </Row>
        <Row style={{margin: '10px 0 0 0'}}>
          <Col span={8}>
            <Input
              name='vcash'
              size='small'
              addonBefore='XVC'
              placeholder={this.t('wallet:amount')}
              onChange={this.convert}
              value={this.amounts.vcash}
            />
          </Col>
          <Col span={8}>
            <div style={{margin: '0 5px 0 5px'}}>
              <Input
                name='bitcoin'
                size='small'
                addonBefore='BTC'
                placeholder={this.t('wallet:amount')}
                onChange={this.convert}
                value={this.amounts.bitcoin}
              />
            </div>
          </Col>
          <Col span={8}>
            <Input
              name='local'
              size='small'
              addonBefore={this.rates.localCurrency}
              placeholder={this.t('wallet:amount')}
              onChange={this.convert}
              value={this.amounts.local}
            />
          </Col>
        </Row>
      </div>
    )
  }
}
