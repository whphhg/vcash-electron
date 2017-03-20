import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Col, Row, Table } from 'antd'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('ui', 'wallet') @observer

export default class Address extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.data = props.data
    this.ui = props.ui
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
      record.spentTxid === ''
        ? record.txid
        : record.spentTxid
      )
  }

  render () {
    return (
      <div style={{margin: '10px 0 7px 0'}}>
        <Row>
          <div style={{float: 'left'}}>
            <i className='material-icons md-18'>account_balance</i>
            <p
              style={{
                display: 'inline-block',
                margin: '0 0 0 5px',
                verticalAlign: '4px'
              }}
            >
              {
                (
                  this.data.account === null && (
                    <span>{this.t('wallet:change')}</span>
                  )
                ) || (
                  this.data.account !== null && (
                    <span>{this.t('wallet:account')}: <b>{
                      this.data.account === ''
                        ? this.t('wallet:default')
                        : this.data.account
                    }</b></span>
                  )
                )
              }
            </p>
          </div>
          <div style={{float: 'right'}}>
            <i className='material-icons md-18'>call_received</i>
            <p
              style={{
                display: 'inline-block',
                margin: '0 15px 0 5px',
                verticalAlign: '4px'
              }}
            >
              {this.t('wallet:received')}: <b>{this.data.received}</b>
            </p>
            <i className='material-icons md-18'>call_made</i>
            <p
              style={{
                display: 'inline-block',
                margin: '0 0 0 5px',
                verticalAlign: '4px'
              }}
            >
              {this.t('wallet:spent')}: <b>{this.data.spent}</b>
            </p>
          </div>
        </Row>
        <Row>
          <Col span={24}>
            {
              this.data.outputs.length > 0 && (
                <Table
                  style={{margin: '10px 0 3px 0'}}
                  bordered
                  size='small'
                  pagination={false}
                  dataSource={this.data.outputs}
                  onRowClick={this.viewTransaction}
                  columns={[
                    {
                      title: this.t('wallet:transactionId'),
                      dataIndex: 'txid',
                      width: 290,
                      render: (txid, record) => (
                        <p className='text-mono'>
                          {
                            (
                              record.spentTxid === '' &&
                              txid.slice(0, 15) + '...' + txid.slice(49, 64)
                            ) || (
                              record.spentTxid !== '' &&
                              (
                                record.spentTxid.slice(0, 15) +
                                '...' +
                                record.spentTxid.slice(49, 64)
                              )
                            )
                          }
                        </p>
                      )
                    },
                    {
                      title: this.t('wallet:amount'),
                      dataIndex: 'amount',
                      render: (amount, record) => (
                        <p
                          style={{textAlign: 'right'}}
                          className={record.color}
                        >
                          {
                            new Intl.NumberFormat(this.ui.language, {
                              minimumFractionDigits: 6,
                              maximumFractionDigits: 6
                            }).format(amount)
                          } XVC
                        </p>
                      )
                    }
                  ]}
                />
              )
            }
          </Col>
        </Row>
      </div>
    )
  }
}
