import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Modal, Table, message } from 'antd'
import moment from 'moment'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('gui', 'rates', 'rpc', 'wallet') @observer

export default class Transaction extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.rates = props.rates
    this.rpc = props.rpc
    this.wallet = props.wallet
  }

  /**
   * Lock transaction.
   * @function ztlock
   */
  ztlock = () => {
    this.rpc.execute([
      { method: 'ztlock', params: [this.wallet.viewing] }
    ], (response) => {
      /** Handle result. */
      if (response[0].hasOwnProperty('result') === true) {
        /** Update txs ztlock status. */
        this.wallet.getWallet()

        /** Display a success message. */
        message.success(this.t('wallet:transactionLocked'), 6)
      }
    })
  }

  render () {
    const { local, average } = this.rates
    const { viewing, viewingTx } = this.wallet

    if (viewing === null) return null
    return (
      <Modal
        footer={null}
        onCancel={() => this.wallet.setViewing()}
        title={this.t('wallet:transactionDetails')}
        visible={viewing !== ''}
        width={1000}
      >
        <div className='flex-sb' style={{alignItems: 'flex-start'}}>
          <div style={{margin: '0 36px 0 0'}}>
            <div className='flex'>
              <i className='material-icons md-16'>label</i>
              <p>{this.t('wallet:transactionId')}</p>
            </div>
            {
              viewingTx.hasOwnProperty('blockhash') === true && (
                <div className='flex'>
                  <i className='material-icons md-16'>extension</i>
                  <p>{this.t('wallet:includedInBlock')}</p>
                </div>
              )
            }
            <div className='flex'>
              <i className='material-icons md-16'>access_time</i>
              <p>{this.t('wallet:relayedOn')}</p>
            </div>
            {
              viewingTx.hasOwnProperty('blocktime') === true &&
              viewingTx.blocktime > 0 && (
                <div className='flex'>
                  <i className='material-icons md-16'>access_time</i>
                  <p>{this.t('wallet:blockFound')}</p>
                </div>
              )
            }
            <div className='flex' style={{margin: '10px 0 0 0'}}>
              <i className='material-icons md-16'>folder</i>
              <p>{this.t('wallet:category')}</p>
            </div>
            <div className='flex'>
              <i className='material-icons md-16'>monetization_on</i>
              <p>{this.t('wallet:amount')}</p>
            </div>
            {
              viewingTx.hasOwnProperty('fee') === true && (
                <div className='flex'>
                  <i className='material-icons md-16'>card_giftcard</i>
                  <p>{this.t('wallet:fee')}</p>
                </div>
              )
            }
            <div className='flex'>
              <i className='material-icons md-16'>done_all</i>
              <p>{this.t('wallet:confirmations')}</p>
            </div>
          </div>
          <div style={{flex: 1}}>
            <div style={{margin: '0 0 10px 0'}}>
              <div className='flex-sb' style={{alignItems: 'flex-start'}}>
                <div>
                  <p style={{fontWeight: '500'}}>{viewingTx.txid}</p>
                  {
                    viewingTx.hasOwnProperty('blockhash') === true && (
                      <p style={{fontWeight: '500'}}>{viewingTx.blockhash}</p>
                    )
                  }
                  <p>
                    {moment(viewingTx.time).format('L - LTS')} (
                    {moment().to(viewingTx.time)})
                  </p>
                  {
                    viewingTx.hasOwnProperty('blocktime') === true &&
                    viewingTx.blocktime > 0 && (
                      <p>{moment(viewingTx.blocktime).format('L - LTS')}</p>
                    )
                  }
                </div>
                <div style={{textAlign: 'right'}}>
                  <p>
                    <a
                      target='_blank'
                      href={'https://explorer.vchain.info/tx/' + viewingTx.txid}
                    >
                      {this.t('wallet:transactionOnExplorer')}
                    </a>
                  </p>
                  <p>
                    <a
                      target='_blank'
                      href={'https://explorer.vchain.info/block/' + viewingTx.blockhash}
                      disabled={
                        viewingTx.hasOwnProperty('blockhash') === false ||
                        viewingTx.blockhash === '0'.repeat(64)
                      }
                    >
                      {this.t('wallet:blockOnExplorer')}
                    </a>
                  </p>
                  {
                    viewingTx.hasOwnProperty('ztlock') === true &&
                    viewingTx.confirmations === 0 &&
                    viewingTx.hasOwnProperty('generated') === false &&
                    viewingTx.hasOwnProperty('blended') === false &&
                    (
                      <p>
                        <a
                          onClick={this.ztlock}
                          disabled={viewingTx.ztlock === true}
                        >
                          {
                            viewingTx.ztlock === true
                              ? this.t('wallet:transactionLocked')
                              : this.t('wallet:transactionLock')
                          }
                        </a>
                      </p>
                    )
                  }
                </div>
              </div>
            </div>
            <div className='flex-sb' style={{alignItems: 'flex-start'}}>
              <div style={{margin: '0 36px 0 0'}}>
                <p style={{fontWeight: '500'}}>
                  {this.t('wallet:' + viewingTx.category)}
                </p>
                <p className={viewingTx.color}>
                  {
                    new Intl.NumberFormat(this.gui.language, {
                      maximumFractionDigits: 6
                    }).format(viewingTx.amount)
                  } XVC (
                  {
                    new Intl.NumberFormat(this.gui.language, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }).format(viewingTx.amount * local * average)
                  } {this.gui.localCurrency})
                </p>
                {
                  viewingTx.hasOwnProperty('fee') === true && (
                    <p className='red'>
                      {
                        new Intl.NumberFormat(this.gui.language, {
                          maximumFractionDigits: 6
                        }).format(viewingTx.fee)
                      } XVC
                    </p>
                  )
                }
                <p className={viewingTx.color}>{viewingTx.confirmations}</p>
              </div>
              <div style={{margin: '0 36px 0 36px'}}>
                {
                  viewingTx.hasOwnProperty('to') === true && (
                    <div className='flex'>
                      <i className='material-icons md-16'>perm_identity</i>
                      <p>{this.t('wallet:recipient')}</p>
                    </div>
                  )
                }
                {
                  viewingTx.hasOwnProperty('comment') === true && (
                    <div className='flex'>
                      <i className='material-icons md-16'>create</i>
                      <p>{this.t('wallet:comment')}</p>
                    </div>
                  )
                }
              </div>
              <div style={{flex: 1}}>
                {
                  viewingTx.hasOwnProperty('to') === true && (
                    <p style={{fontWeight: '500'}}>{viewingTx.to}</p>
                  )
                }
                {
                  viewingTx.hasOwnProperty('comment') === true && (
                    <p style={{textAlign: 'justify'}}>{viewingTx.comment}</p>
                  )
                }
              </div>
            </div>
          </div>
        </div>
        <div className='flex-sb' style={{margin: '10px 0 0 0'}}>
          <Table
            bordered
            columns={[
              {
                dataIndex: 'address',
                title: this.t('wallet:from'),
                width: 290,
                render: address => <p className='text-mono'>{address}</p>
              },
              {
                dataIndex: 'amount',
                title: this.t('wallet:amount'),
                render: amount => (
                  <p style={{textAlign: 'right'}}>
                    {
                      new Intl.NumberFormat(this.gui.language, {
                        minimumFractionDigits: 6,
                        maximumFractionDigits: 6
                      }).format(amount)
                    } XVC
                  </p>
                )
              }
            ]}
            dataSource={[...viewingTx.inputs]}
            locale={{emptyText: this.t('wallet:coinbase')}}
            pagination={false}
            scroll={viewingTx.inputs.length > 8 ? {y: 190} : {}}
            size='small'
            style={{flex: 1, margin: '0 10px 0 0'}}
          />
          <i className='material-icons md-18'>forward</i>
          <Table
            bordered
            columns={[
              {
                dataIndex: 'address',
                title: this.t('wallet:to'),
                width: 290,
                render: address => <p className='text-mono'>{address}</p>
              },
              {
                dataIndex: 'amount',
                title: this.t('wallet:amount'),
                render: (amount, record) => (
                  <p className={record.color} style={{textAlign: 'right'}}>
                    {
                      new Intl.NumberFormat(this.gui.language, {
                        minimumFractionDigits: 6,
                        maximumFractionDigits: 6
                      }).format(amount)
                    } XVC
                  </p>
                )
              }
            ]}
            dataSource={[...viewingTx.outputs]}
            pagination={false}
            scroll={viewingTx.outputs.length > 8 ? {y: 190} : {}}
            size='small'
            style={{flex: 1, margin: '0 0 0 10px'}}
          />
        </div>
      </Modal>
    )
  }
}
