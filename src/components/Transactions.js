import React from 'react'
import { inject, observer } from 'mobx-react'
import { Col, Input, Radio, Row } from 'antd'

/** Required components. */
import ChainBlender from './ChainBlender'
import CurrencyConverter from './CurrencyConverter'
import TransactionsChart from './TransactionsChart'
import TransactionsTable from './TransactionsTable'

/** Make the component reactive and inject MobX stores. */
@inject('transactions') @observer

class Transactions extends React.Component {
  constructor (props) {
    super(props)
    this.transactions = props.transactions
    this.filtersUpdateTimer = null
    this.setFilters = this.setFilters.bind(this)
    this.setShowCategory = this.setShowCategory.bind(this)
  }

  setFilters (event) {
    clearTimeout(this.filtersUpdateTimer)
    const filter = event.target.value

    this.filtersUpdateTimer = setTimeout(() => {
      this.transactions.setFilters(filter)
    }, 0.5 * 1000)
  }

  setShowCategory (event) {
    this.transactions.setShowCategory(event.target.value)
  }

  render () {
    return (
      <div>
        <Row className='shadow'>
          <div className='toolbar'>
            <Col span={6}>
              <ChainBlender />
              <CurrencyConverter />
            </Col>
            <Col span={12} className='text-center'>
              <Radio.Group
                defaultValue={this.transactions.showCategory}
                onChange={this.setShowCategory}
              >
                <Radio.Button value='all'>All</Radio.Button>
                <Radio.Button value='0'>Received</Radio.Button>
                <Radio.Button value='1'>Sent</Radio.Button>
                <Radio.Button value='2'>Generated</Radio.Button>
              </Radio.Group>
            </Col>
            <Col span={6}>
              <Input
                onChange={this.setFilters}
                placeholder='Filter transactions'
                addonAfter={<i className='material-icons md-16'>search</i>}
              />
            </Col>
          </div>
        </Row>
        <Row>
          <Col span={24}>
            <div className='shadow-2'>
              <div id='transactions'>
                <TransactionsTable />
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <TransactionsChart />
          </Col>
        </Row>
      </div>
    )
  }
}

export default Transactions
