import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Input, Table } from 'antd'
import moment from 'moment'

/** Required components. */
import ChainBlender from './ChainBlender'
import { TransactionsStatistics } from './charts'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('gui', 'wallet') @observer

export default class Transactions extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
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
      <div
        style={{
          display: 'grid',
          gridTemplateRows: '35px 1fr 160px',
          height: '100%'
        }}
      >
        <div className='shadow'>
          <div style={{margin: '0 10px 0 10px'}}>
            <div className='flex-sb' style={{height: '35px'}}>
              <div>
                <ChainBlender />
              </div>
              <div className='flex'>
                <Input
                  onChange={this.setSearch}
                  placeholder={this.t('wallet:searchTransactions')}
                  prefix={<i className='material-icons md-14'>search</i>}
                  size='small'
                  style={{width: '268px'}}
                />
              </div>
            </div>
          </div>
        </div>
        <div className='shadow'>
          <div style={{margin: '10px 10px 0 10px', textAlign: 'center'}}>
            <Table
              bordered
              columns={[
                {
                  dataIndex: 'time',
                  title: this.t('wallet:date'),
                  width: 140,
                  render: text => moment(text).format('L - LTS')
                },
                {
                  dataIndex: 'category',
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
                    value.includes(record.category) === true,
                  title: this.t('wallet:category'),
                  width: 150,
                  render: category => this.t('wallet:' + category)
                },
                {
                  dataIndex: 'comment',
                  title: this.t('wallet:description'),
                  width: 360
                },
                {
                  dataIndex: 'amount',
                  title: this.t('wallet:amount'),
                  width: 150,
                  render: (text, record) => (
                    <p className={record.color} style={{textAlign: 'right'}}>
                      {text} XVC
                    </p>
                  )
                },
                {
                  dataIndex: 'amountLocal',
                  title: this.gui.localCurrency,
                  width: 150,
                  render: (text, record) => (
                    <p className={record.color} style={{textAlign: 'right'}}>
                      {text} {this.gui.localCurrency}
                    </p>
                  )
                }
              ]}
              dataSource={this.wallet.transactionsData}
              locale={{
                emptyText: this.t('wallet:notFound'),
                filterConfirm: this.t('wallet:ok'),
                filterReset: this.t('wallet:reset')
              }}
              onRowClick={this.view}
              pagination={{
                defaultPageSize: 15,
                style: { display: 'inline-block' }
              }}
              size='small'
            />
          </div>
        </div>
        <div style={{minWidth: '100%'}}><TransactionsStatistics /></div>
      </div>
    )
  }
}
