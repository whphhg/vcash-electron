import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Col, Input, Row, Table } from 'antd'
import moment from 'moment'

/** Required components. */
import ChainBlender from './ChainBlender'
import TransactionsChart from './TransactionsChart'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('rates', 'transactions') @observer

export default class Transactions extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.rates = props.rates
    this.transactions = props.transactions
    this.filtersUpdateTimer = null
    this.setFilters = this.setFilters.bind(this)
    this.rowClick = this.rowClick.bind(this)
  }

  rowClick (record, index) {
    this.transactions.setViewing(record.txid)
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

  render () {
    return (
      <div>
        <Row className='shadow'>
          <div className='toolbar'>
            <ChainBlender />
            <Input
              size='small'
              className='right'
              onChange={this.setFilters}
              placeholder={this.t('wallet:filterTransactions')}
              style={{width: '230px'}}
            />
          </div>
        </Row>
        <div className='shadow-2'>
          <div id='transactions'>
            <Table
              bordered
              size='small'
              pagination={{defaultPageSize: 15}}
              dataSource={this.transactions.filtered}
              onRowClick={this.rowClick}
              locale={{
                filterConfirm: this.t('wallet:ok'),
                filterReset: this.t('wallet:reset'),
                emptyText: this.t('wallet:notFound')
              }}
              columns={[
                {
                  title: this.t('wallet:date'),
                  dataIndex: 'time',
                  width: 130,
                  render: text => moment(text).format('l - HH:mm:ss')
                },
                {
                  title: this.t('wallet:category'),
                  dataIndex: 'category',
                  width: 130,
                  render: text => this.t('wallet:' + text),
                  filters: [
                    {
                      text: this.t('wallet:received'),
                      value: ['receiving', 'received']
                    },
                    {
                      text: this.t('wallet:sent'),
                      value: ['sending', 'sent']
                    },
                    {
                      text: this.t('wallet:sentToSelf'),
                      value: ['sendingToSelf', 'sentToSelf']
                    },
                    {
                      text: this.t('wallet:blended'),
                      value: ['blending', 'blended']
                    },
                    {
                      text: this.t('wallet:rewards'),
                      value: [
                        'stakingReward',
                        'miningReward',
                        'incentiveReward'
                      ]
                    }
                  ],
                  onFilter: (value, record) =>
                    value.includes(record.category) === true
                },
                {
                  title: this.t('wallet:description'),
                  dataIndex: 'comment',
                  width: 400
                },
                {
                  title: this.t('wallet:amount'),
                  dataIndex: 'amount',
                  width: 150,
                  render: (text, record) => (
                    <p className={'text-right ' + record.color}>
                      {text} XVC
                    </p>
                  )
                },
                {
                  title: this.rates.localCurrency,
                  dataIndex: 'amountLocal',
                  width: 150,
                  render: (text, record) => (
                    <p className={'text-right ' + record.color}>
                      {text} {this.rates.localCurrency}
                    </p>
                  )
                }
              ]}
            />
          </div>
        </div>
        <Row>
          <Col span={24}>
            <TransactionsChart />
          </Col>
        </Row>
      </div>
    )
  }
}
