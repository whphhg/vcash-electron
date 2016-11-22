import React from 'react'
import { inject, observer } from 'mobx-react'
import { Button, Col, Input, Popover, Row } from 'antd'

/** Make the component reactive and inject MobX stores. */
@inject('currencyConverter', 'rates') @observer

class CurrencyConverter extends React.Component {
  constructor(props) {
    super(props)
    this.currencyConverter = props.currencyConverter
    this.rates = props.rates
    this.onChange = this.onChange.bind(this)
  }

  onChange(event) {
    this.currencyConverter.setAmount(event.target.value, event.target.name)
  }

  popoverTitle() {
    return (
      <div className='popoverTitle'>
        <p>Approximately convert between currencies</p>
        <div style={{float: 'right'}}>
          <img src='./assets/images/exchangePoloniex.png' />
          <p><span>{parseFloat(this.rates.poloniex.last).toFixed(8)}</span> BTC</p>
          <img src='./assets/images/exchangeBittrex.png' />
          <p><span>{parseFloat(this.rates.bittrex.Last).toFixed(8)}</span> BTC</p>
        </div>
      </div>
    )
  }

  popoverContent() {
    return (
      <Row>
        <Col span={7}>
          <p style={{margin: '0 0 5px 0'}}>
            <span className='text-dotted'>XVC</span>
          </p>
          <Input
            type='text'
            name='vcash'
            placeholder='Amount'
            onChange={this.onChange}
            value={this.currencyConverter.vcash}
          />
        </Col>
        <Col offset={1} span={8}>
          <p style={{margin: '0 0 5px 0'}}>
            <span className='text-dotted'>BTC</span>
          </p>
          <Input
            type='text'
            name='bitcoin'
            placeholder='Amount'
            onChange={this.onChange}
            value={this.currencyConverter.bitcoin}
          />
        </Col>
        <Col offset={1} span={7}>
          <p style={{margin: '0 0 5px 0'}}>
            <span className='text-dotted'>{this.rates.localCurrency}</span>
          </p>
          <Input
            type='text'
            name='local'
            placeholder='Amount'
            onChange={this.onChange}
            value={this.currencyConverter.local}
          />
        </Col>
      </Row>
    )
  }

  render() {
    return (
      <Popover
        trigger='click'
        placement='bottomLeft'
        title={this.popoverTitle()}
        content={this.popoverContent()}
      >
        <Button>Currency converter</Button>
      </Popover>
    )
  }
}

export default CurrencyConverter
