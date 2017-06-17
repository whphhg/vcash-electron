import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Input, Table } from 'antd'
import moment from 'moment'

/** Required components. */
import ChainBlender from './ChainBlender'
import { TransactionsStatistics } from './charts'

@translate(['wallet'], { wait: true })
@inject('gui', 'wallet')
@observer
class Transactions extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.wallet = props.wallet
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
          <div style={{ margin: '0 10px 0 10px' }}>
            <div className='flex-sb' style={{ height: '35px' }}>
              <div>
                <ChainBlender />
              </div>
              <div className='flex'>
                <Input
                  onChange={e => this.wallet.setSearch('txs', e.target.value)}
                  placeholder={this.t('wallet:searchTransactions')}
                  prefix={<i className='material-icons md-14'>search</i>}
                  size='small'
                  style={{ width: '268px' }}
                  value={this.wallet.search.txs.value}
                />
              </div>
            </div>
          </div>
        </div>
        <div className='shadow'>
          <div style={{ margin: '10px 10px 0 10px', textAlign: 'center' }}>
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
                  width: 360,
                  render: comment =>
                    <div
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        width: '360px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {comment}
                    </div>
                },
                {
                  dataIndex: 'amount',
                  title: this.t('wallet:amount'),
                  width: 150,
                  render: (text, record) =>
                    <p className={record.color} style={{ textAlign: 'right' }}>
                      {text} XVC
                    </p>
                },
                {
                  dataIndex: 'amountLocal',
                  title: this.gui.localCurrency,
                  width: 150,
                  render: (text, record) =>
                    <p className={record.color} style={{ textAlign: 'right' }}>
                      {text} {this.gui.localCurrency}
                    </p>
                }
              ]}
              dataSource={this.wallet.txsData}
              locale={{
                emptyText: this.t('wallet:notFound'),
                filterConfirm: this.t('wallet:ok'),
                filterReset: this.t('wallet:reset')
              }}
              onRowClick={record => this.wallet.setViewing(record.txid)}
              pagination={{
                defaultPageSize: 15,
                style: { display: 'inline-block' }
              }}
              size='small'
            />
          </div>
        </div>
        <div style={{ minWidth: '100%' }}>
          <TransactionsStatistics />
        </div>
      </div>
    )
  }
}

export default Transactions
