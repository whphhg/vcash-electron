import React from 'react'
import { inject, observer } from 'mobx-react'
import { Col, Row, Select } from 'antd'

/** Make the component reactive and inject MobX stores. */
@observer(['rates', 'wallet'])

class Maintenance extends React.Component {
  constructor(props) {
    super(props)
    this.rates = props.rates
    this.wallet = props.wallet

    /** Bind functions early. */
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
        <Col offset={11} span={6}>
          <div className='margin-10' style={{textAlign:'right'}}>
            <p className='toolbar-text'>Vcash {this.wallet.version} &nbsp;&bull;&nbsp; Wallet {this.wallet.walletversion} &nbsp;&bull;&nbsp; UI {process.env.npm_package_version}</p>
          </div>
        </Col>
      </Row>
    )
  }
}

export default Maintenance
