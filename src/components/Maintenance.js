import React from 'react'
import { inject, observer } from 'mobx-react'
import { Col, Row, Select } from 'antd'

/** Make the component reactive and inject MobX stores. */
@observer(['rates'])

class Maintenance extends React.Component {
  constructor(props) {
    super(props)
    this.rates = props.rates

    /** Bind functions early. */
    this.setLocalCurrency = this.setLocalCurrency.bind(this)
  }

  setLocalCurrency(value) {
    this.rates.setLocalCurrency(value)
  }

  render() {
    return (
      <Row>
        <Col span={4}>
          <p>Set local currency</p>
          <Select showSearch
            style={{ width: 200 }}
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
