import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Input, Row, Table } from 'antd'
import moment from 'moment'

/** Required components. */
import ChainBlender from './ChainBlender'
import { TransactionsStatistics } from './charts'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('rates', 'wallet') @observer

export default class Transactions extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.rates = props.rates
    this.wallet = props.wallet
    this.searchUpdateTimer = null
  }

  /**
   * View transaction details on row click.
   * @function view
   * @param {object} record - Table row data.
   * @param {number} index - Table row index.
   */
  view = (record, index) => {
    this.wallet.setViewing(record.txid)
  }

  /**
   * Set search string.
   * @function setSearch
   * @param {object} e - Input element event.
   */
  setSearch = (e) => {
    clearTimeout(this.searchUpdateTimer)

    /** Save entered values. */
    const keywords = e.target.value

    /**
     * Start a new update timer and update if there
     * are no changes made in the last half second.
     */
    this.searchUpdateTimer = setTimeout(() => {
      this.wallet.setSearch(keywords)
    }, 0.5 * 1000)
  }

  render () {
    return (
      <div>
        <Row className='shadow'>
          <div className='toolbar'>
            <div style={{float: 'left'}}>
              <ChainBlender />
            </div>
            <div style={{float: 'right'}}>
              <Input
                size='small'
                onChange={this.setSearch}
                placeholder={this.t('wallet:searchTransactions')}
                style={{width: '230px'}}
              />
            </div>
          </div>
        </Row>
        <div className='shadow-2'>
          <div
            style={{
              minHeight: '410px',
              margin: '10px',
              textAlign: 'center'
            }}
          >
            <Table
              bordered
              size='small'
              pagination={{
                defaultPageSize: 15,
                style: {
                  display: 'inline-block'
                }
              }}
              dataSource={this.wallet.transactionsData}
              onRowClick={this.view}
              locale={{
                filterConfirm: this.t('wallet:ok'),
                filterReset: this.t('wallet:reset'),
                emptyText: this.t('wallet:notFound')
              }}
              columns={[
                {
                  title: this.t('wallet:date'),
                  dataIndex: 'time',
                  width: 140,
                  render: text => moment(text).format('L - LTS')
                },
                {
                  title: this.t('wallet:category'),
                  dataIndex: 'category',
                  width: 130,
                  render: category => this.t('wallet:' + category),
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
                  width: 380
                },
                {
                  title: this.t('wallet:amount'),
                  dataIndex: 'amount',
                  width: 150,
                  render: (text, record) => (
                    <p
                      className={record.color}
                      style={{textAlign: 'right'}}
                    >
                      {text} XVC
                    </p>
                  )
                },
                {
                  title: this.rates.localCurrency,
                  dataIndex: 'amountLocal',
                  width: 150,
                  render: (text, record) => (
                    <p
                      className={record.color}
                      style={{textAlign: 'right'}}
                    >
                      {text} {this.rates.localCurrency}
                    </p>
                  )
                }
              ]}
            />
          </div>
        </div>
        <TransactionsStatistics />
      </div>
    )
  }
}
