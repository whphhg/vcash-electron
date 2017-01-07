import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Button, Col, Input, Popover, Row } from 'antd'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('currencyConverter', 'rates') @observer

class CurrencyConverter extends React.Component {
  constructor (props) {
    super(props)
    this.currencyConverter = props.currencyConverter
    this.rates = props.rates
    this.t = props.t
    this.onChange = this.onChange.bind(this)
  }

  onChange (e) {
    this.currencyConverter.setAmount(e.target.value, e.target.name)
  }

  popoverTitle () {
    return (
      <div className='popoverTitle'>
        <p>{this.t('wallet:currencyConverterLong')}</p>
        <div style={{float: 'right'}}>
          <img src='./assets/images/exchangePoloniex.png' />
          <p>
            <span>{parseFloat(this.rates.poloniex.last).toFixed(8)}</span> BTC
          </p>
          <img src='./assets/images/exchangeBittrex.png' />
          <p>
            <span>{parseFloat(this.rates.bittrex.Last).toFixed(8)}</span> BTC
          </p>
        </div>
      </div>
    )
  }

  popoverContent () {
    /** Destructure properties. */
    const {
      vcash,
      bitcoin,
      local
    } = this.currencyConverter

    const {
      localCurrency
    } = this.rates

    return (
      <Row>
        <Col span={7}>
          <p style={{margin: '0 0 5px 0'}}>
            <span className='text-dotted'>
              XVC
            </span>
          </p>
          <Input
            type='text'
            name='vcash'
            placeholder={this.t('wallet:amount')}
            onChange={this.onChange}
            value={vcash}
          />
        </Col>
        <Col offset={1} span={8}>
          <p style={{margin: '0 0 5px 0'}}>
            <span className='text-dotted'>
              BTC
            </span>
          </p>
          <Input
            type='text'
            name='bitcoin'
            placeholder={this.t('wallet:amount')}
            onChange={this.onChange}
            value={bitcoin}
          />
        </Col>
        <Col offset={1} span={7}>
          <p style={{margin: '0 0 5px 0'}}>
            <span className='text-dotted'>
              {localCurrency}
            </span>
          </p>
          <Input
            type='text'
            name='local'
            placeholder={this.t('wallet:amount')}
            onChange={this.onChange}
            value={local}
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
