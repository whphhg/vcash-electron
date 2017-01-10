import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Col, Input, Radio, Row } from 'antd'

/** Required components. */
import ChainBlender from './ChainBlender'
import CurrencyConverter from './CurrencyConverter'
import TransactionsChart from './TransactionsChart'
import TransactionsTable from './TransactionsTable'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('transactions') @observer

class Transactions extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.transactions = props.transactions
    this.filtersUpdateTimer = null
    this.setFilters = this.setFilters.bind(this)
    this.setShowCategory = this.setShowCategory.bind(this)
  }

  setFilters (e) {
    clearTimeout(this.filtersUpdateTimer)

    /** Save entered values. */
    const filter = e.target.value

    /**
     * Start a new update timer and update if there
     * are no changes made in the last half second.
     */
    this.filtersUpdateTimer = setTimeout(() => {
      this.transactions.setFilters(filter)
    }, 0.5 * 1000)
  }

  setShowCategory (e) {
    this.transactions.setShowCategory(e.target.value)
  }

  render () {
    const { Button, Group } = Radio

    return (
      <div>
        <Row className='shadow'>
          <div className='toolbar'>
            <Col span={6}>
              <ChainBlender />
              <CurrencyConverter />
            </Col>
            <Col span={12} className='text-center'>
              <Group
                defaultValue={this.transactions.showCategory}
                onChange={this.setShowCategory}
              >
                <Button value='all'>
                  {this.t('wallet:all')}
                </Button>
                <Button value='0'>
                  {this.t('wallet:received')}
                </Button>
                <Button value='1'>
                  {this.t('wallet:sent')}
                </Button>
                <Button value='2'>
                  {this.t('wallet:generated')}
                </Button>
              </Group>
            </Col>
            <Col span={6}>
              <Input
                onChange={this.setFilters}
                placeholder={this.t('wallet:filterTransactions')}
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
