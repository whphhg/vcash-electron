import React from 'react'
import { inject, observer } from 'mobx-react'
import { Col, Row, Select } from 'antd'

/** Make the component reactive and inject MobX stores. */
@observer(['rates'])

/**
 * TODO: Implement wallet check and repair.
 * TODO: Implement wallet passphrase change.
 */
class Maintenance extends React.Component {
  constructor(props) {
    super(props)
    this.rates = props.rates
    this.setLocalCurrency = this.setLocalCurrency.bind(this)
  }

  setLocalCurrency(value) {
    this.rates.setLocalCurrency(value)
  }

  render() {
    return (
      <Row>
        <Col span={3}>
          <div className='margin-10'>
            <p className='toolbar-text'>Select local currency</p>
          </div>
        </Col>
        <Col span={4}>
          <Select showSearch
            style={{width:'100px'}}
            className='margin-10'
            placeholder={this.rates.localCurrency}
            optionFilterProp='children'
            notFoundContent='Currency not found.'
            onChange={this.setLocalCurrency}
          >
            {
              this.rates.localCurrencies.map((currency) => (
                <Select.Option key={currency} value={currency}>{currency}</Select.Option>
              ))
            }
          </Select>
        </Col>
      </Row>
    )
  }
}

export default Maintenance
