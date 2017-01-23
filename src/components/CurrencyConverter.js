import React from 'react'
import { translate } from 'react-i18next'
import { action, computed, observable } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Button, Col, Input, Popover, Row } from 'antd'
import { decimalSeparator } from '../utilities/common'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('rates', 'ui') @observer

class CurrencyConverter extends React.Component {
  @observable from = 'vcash'
  @observable amount = 1

  constructor (props) {
    super(props)
    this.t = props.t
    this.rates = props.rates
    this.ui = props.ui
    this.onChange = this.onChange.bind(this)
  }

  @computed get converted () {
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

  @action onChange (e) {
    const from = e.target.name
    const amount = e.target.value

    /** Allow only amount in 0000000[.,]000000 format. */
    switch (decimalSeparator()) {
      case '.':
        if (amount.match(/^\d{0,7}(?:\.\d{0,6})?$/) === null) return
        break

      case ',':
        if (amount.match(/^\d{0,7}(?:,\d{0,6})?$/) === null) return
        break
    }

    this.from = from
    this.amount = amount
  }

  popoverTitle () {
    const { bittrex, poloniex } = this.rates

    return (
      <div className='popoverTitle'>
        <p>{this.t('wallet:currencyConverterLong')}</p>
        <div style={{float: 'right'}}>
          <img src='./assets/images/exchangePoloniex.png' />
          <p>
            <span>
              {
                new Intl.NumberFormat(this.ui.language, {
                  minimumFractionDigits: 8,
                  maximumFractionDigits: 8
                }).format(poloniex.last)
              }
            </span> BTC
          </p>
          <img src='./assets/images/exchangeBittrex.png' />
          <p>
            <span>
              {
                new Intl.NumberFormat(this.ui.language, {
                  minimumFractionDigits: 8,
                  maximumFractionDigits: 8
                }).format(bittrex.Last)
              }
            </span> BTC
          </p>
        </div>
      </div>
    )
  }

  popoverContent () {
    return (
      <Row>
        <Col span={7}>
          <p style={{margin: '0 0 5px 0'}}>
            <span className='text-dotted'>XVC</span>
          </p>
          <Input
            name='vcash'
            placeholder={this.t('wallet:amount')}
            onChange={this.onChange}
            value={this.converted.vcash}
          />
        </Col>
        <Col offset={1} span={8}>
          <p style={{margin: '0 0 5px 0'}}>
            <span className='text-dotted'>BTC</span>
          </p>
          <Input
            name='bitcoin'
            placeholder={this.t('wallet:amount')}
            onChange={this.onChange}
            value={this.converted.bitcoin}
          />
        </Col>
        <Col offset={1} span={7}>
          <p style={{margin: '0 0 5px 0'}}>
            <span className='text-dotted'>
              {this.rates.localCurrency}
            </span>
          </p>
          <Input
            name='local'
            placeholder={this.t('wallet:amount')}
            onChange={this.onChange}
            value={this.converted.local}
          />
        </Col>
      </Row>
    )
  }

  render () {
    return (
      <Popover
        trigger='click'
        placement='bottomLeft'
        title={this.popoverTitle()}
        content={this.popoverContent()}
      >
        <Button>{this.t('wallet:currencyConverter')}</Button>
      </Popover>
    )
  }
}

export default CurrencyConverter
