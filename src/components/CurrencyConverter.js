import React from 'react'
import { inject, observer } from 'mobx-react'
import { Button, Col, Input, Popover, Row } from 'antd'

/** Make the component reactive and inject MobX stores. */
@observer(['currencyConverter', 'rates'])

class CurrencyConverter extends React.Component {
  constructor(props) {
    super(props)
    this.currencyConverter = props.currencyConverter
    this.rates = props.rates
    this.onChange = this.onChange.bind(this)
  }

  onChange(event) {
    this.currencyConverter.setAmount(event.target.value, event.target.id)
  }

  popoverContent() {
    return (
      <Row style={{width:'400px'}}>
        <Col span={7}>
          <p style={{marginBottom:'5px'}}><span className='font-weight-500'>XVC</span></p>
          <Input type='text' autosize id='vcash' placeholder='Amount' onChange={this.onChange} value={this.currencyConverter.vcash} />
        </Col>
        <Col offset={1} span={8}>
          <p style={{marginBottom:'5px'}}><span className='font-weight-500'>BTC</span></p>
          <Input type='text' autosize id='bitcoin' placeholder='Amount' onChange={this.onChange} value={this.currencyConverter.bitcoin} />
        </Col>
        <Col offset={1} span={7}>
          <p style={{marginBottom:'5px'}}><span className='font-weight-500'>{this.rates.localCurrency}</span></p>
          <Input type='text' autosize id='local' placeholder='Amount' onChange={this.onChange} value={this.currencyConverter.local} />
        </Col>
      </Row>
    )
  }

  render() {
    return (
      <Popover trigger='click' placement='bottomLeft' title='Approximately convert between currencies' content={this.popoverContent()}>
        <Button>Currency converter</Button>
      </Popover>
    )
  }
}

export default CurrencyConverter
