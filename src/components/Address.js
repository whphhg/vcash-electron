import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Table } from 'antd'

/** Address details component. */
@translate(['wallet'], { wait: true })
@inject('gui', 'wallet')
@observer
class Address extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.data = props.data
    this.gui = props.gui
    this.wallet = props.wallet
  }

  /**
   * View transaction details on row click.
   * @function viewTransaction
   * @param {object} record - Table row data.
   * @param {number} index - Table row index.
   */
  viewTransaction = (record, index) => {
    this.wallet.setViewing(
      record.spentTxid === '' ? record.txid : record.spentTxid
    )
  }

  render () {
    return (
      <div style={{ margin: '5px 0 6px 0' }}>
        <div className='flex-sb' style={{ margin: '0 0 10px 0' }}>
          <div className='flex'>
            <i className='material-icons md-16'>account_balance</i>
            {(this.data.account === null &&
              <p>
                {this.t('wallet:change')}
              </p>) ||
              (this.data.account !== null &&
                <p>
                  {this.t('wallet:acc')}:{' '}
                  <span style={{ fontWeight: '500' }}>
                    {this.data.account === ''
                      ? this.t('wallet:default')
                      : this.data.account}
                  </span>
                </p>)}
          </div>
          <div className='flex'>
            <i className='material-icons md-16'>call_received</i>
            <p style={{ margin: '0 10px 0 5px' }}>
              {this.t('wallet:received')}:{' '}
              <span style={{ fontWeight: '500' }}>{this.data.received}</span>
            </p>
            <i className='material-icons md-16'>call_made</i>
            <p>
              {this.t('wallet:spent')}:{' '}
              <span style={{ fontWeight: '500' }}>{this.data.spent}</span>
            </p>
          </div>
        </div>
        {this.data.outputs.length > 0 &&
          <div style={{ textAlign: 'center' }}>
            <Table
              bordered
              columns={[
                {
                  dataIndex: 'txid',
                  title: this.t('wallet:transactionId'),
                  width: 275,
                  render: (txid, record) =>
                    <p className='text-mono'>
                      {(record.spentTxid === '' &&
                        txid.slice(0, 15) + '...' + txid.slice(49, 64)) ||
                        (record.spentTxid !== '' &&
                          record.spentTxid.slice(0, 15) +
                            '...' +
                            record.spentTxid.slice(49, 64))}
                    </p>
                },
                {
                  dataIndex: 'amount',
                  title: this.t('wallet:amount'),
                  render: (amount, record) =>
                    <p className={record.color} style={{ textAlign: 'right' }}>
                      {new Intl.NumberFormat(this.gui.language, {
                        minimumFractionDigits: 6,
                        maximumFractionDigits: 6
                      }).format(amount)}{' '}
                      XVC
                    </p>
                }
              ]}
              dataSource={this.data.outputs}
              onRowClick={this.viewTransaction}
              pagination={this.data.outputs.length > 10}
              size='small'
            />
          </div>}
      </div>
    )
  }
}

export default Address
