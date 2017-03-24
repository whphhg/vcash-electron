import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Col, Modal, Row, Table, message } from 'antd'
import moment from 'moment'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('rates', 'rpc', 'ui', 'wallet') @observer

export default class Transaction extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.rates = props.rates
    this.rpc = props.rpc
    this.ui = props.ui
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

  /**
   * Toggle modal.
   * @function toggleModal
   */
  toggleModal = () => {
    this.wallet.setViewing()
  }

  render () {
    const { local, localCurrency, average } = this.rates
    const { viewing, viewingTx } = this.wallet

    if (viewing === null) return null
    return (
      <Modal
        title={this.t('wallet:transactionDetails')}
        width={1000}
        visible={viewing !== ''}
        onCancel={this.toggleModal}
        footer={null}
      >
        <Row>
          <Col span={18}>
            <Row>
              <Col span={1}>
                <i className='material-icons md-18'>label</i>
              </Col>
              <Col span={4}>
                {this.t('wallet:transactionId')}
              </Col>
              <Col span={19}>
                <span style={{fontWeight: '500'}}>
                  {viewingTx.txid}
                </span>
              </Col>
            </Row>
            {
              viewingTx.hasOwnProperty('blockhash') === true &&
              (
                <Row>
                  <Col span={1}>
                    <i className='material-icons md-18'>extension</i>
                  </Col>
                  <Col span={4}>
                    {this.t('wallet:includedInBlock')}
                  </Col>
                  <Col span={19}>
                    <span style={{fontWeight: '500'}}>
                      {viewingTx.blockhash}
                    </span>
                  </Col>
                </Row>
              )
            }
            <Row>
              <Col span={1}>
                <i className='material-icons md-18'>access_time</i>
              </Col>
              <Col span={4}>
                {this.t('wallet:relayedOn')}
              </Col>
              <Col span={19}>
                {moment(viewingTx.time).format('L - LTS')}
                {' (' + moment().to(viewingTx.time)})
              </Col>
            </Row>
            {
              viewingTx.hasOwnProperty('blocktime') === true &&
              viewingTx.blocktime > 0 &&
              (
                <Row>
                  <Col span={1}>
                    <i className='material-icons md-18'>access_time</i>
                  </Col>
                  <Col span={4}>
                    {this.t('wallet:blockFound')}
                  </Col>
                  <Col span={19}>
                    {moment(viewingTx.blocktime).format('L - LTS')}
                  </Col>
                </Row>
              )
            }
          </Col>
          <Col span={6} style={{textAlign: 'right'}}>
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
                  viewingTx.blockhash === '0000000000000000000000000000000000000000000000000000000000000000'
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
          </Col>
        </Row>
        <Row
          style={{margin: '15px 0 0 0'}}
          align='bottom'
          type='flex'
        >
          <Col span={9}>
            <Row>
              <Col span={2}>
                <i className='material-icons md-18'>folder</i>
              </Col>
              <Col span={8}>
                {this.t('wallet:category')}
              </Col>
              <Col span={14}>
                {this.t('wallet:' + viewingTx.category)}
              </Col>
            </Row>
            <Row>
              <Col span={2}>
                <i className='material-icons md-18'>monetization_on</i>
              </Col>
              <Col span={8}>
                {this.t('wallet:amount')}
              </Col>
              <Col span={14} className={viewingTx.color}>
                {
                  new Intl.NumberFormat(this.ui.language, {
                    minimumFractionDigits: 6,
                    maximumFractionDigits: 6
                  }).format(viewingTx.amount)
                } XVC (
                {
                  new Intl.NumberFormat(this.ui.language, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }).format(viewingTx.amount * local * average)
                } {localCurrency})
              </Col>
            </Row>
            {
              viewingTx.hasOwnProperty('fee') === true && (
                <Row>
                  <Col span={2}>
                    <i className='material-icons md-18'>card_giftcard</i>
                  </Col>
                  <Col span={8}>
                    {this.t('wallet:fee')}
                  </Col>
                  <Col span={12} className='red'>
                    {
                      new Intl.NumberFormat(this.ui.language, {
                        minimumFractionDigits: 6,
                        maximumFractionDigits: 6
                      }).format(viewingTx.fee)
                    } XVC
                  </Col>
                </Row>
              )
            }
            <Row>
              <Col span={2}>
                <i className='material-icons md-18'>done_all</i>
              </Col>
              <Col span={8}>
                {this.t('wallet:confirmations')}
              </Col>
              <Col span={12} className={viewingTx.color}>
                {viewingTx.confirmations}
              </Col>
            </Row>
          </Col>
          <Col span={11} offset={4}>
            {
              viewingTx.hasOwnProperty('to') === true && (
                <Row>
                  <Col span={6}>
                    <Row>
                      <Col span={6}>
                        <i className='material-icons md-18'>perm_identity</i>
                      </Col>
                      <Col span={18}>
                        {this.t('wallet:recipient')}
                      </Col>
                    </Row>
                  </Col>
                  <Col span={18} style={{textAlign: 'justify'}}>
                    {viewingTx.to}
                  </Col>
                </Row>
              )
            }
            {
              viewingTx.hasOwnProperty('comment') === true && (
                <Row>
                  <Col span={6}>
                    <Row>
                      <Col span={6}>
                        <i className='material-icons md-18'>create</i>
                      </Col>
                      <Col span={18}>
                        {this.t('wallet:comment')}
                      </Col>
                    </Row>
                  </Col>
                  <Col span={18} style={{textAlign: 'justify'}}>
                    {viewingTx.comment}
                  </Col>
                </Row>
              )
            }
          </Col>
        </Row>
        <Row style={{margin: '15px 0 0 0'}}>
          <Col span={11}>
            <Table
              bordered
              size='small'
              scroll={
                viewingTx.inputs.length > 8
                  ? {y: 190}
                  : {}
              }
              pagination={false}
              dataSource={[...viewingTx.inputs]}
              locale={{
                emptyText: this.t('wallet:coinbase')
              }}
              columns={[
                {
                  title: this.t('wallet:from'),
                  dataIndex: 'address',
                  width: 290,
                  render: address => (
                    <p className='text-mono'>{address}</p>
                  )
                },
                {
                  title: this.t('wallet:amount'),
                  dataIndex: 'amount',
                  render: amount => (
                    <p style={{textAlign: 'right'}}>
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
          </Col>
          <Col span={2} style={{textAlign: 'center'}}>
            <i className='material-icons md-20'>forward</i>
          </Col>
          <Col span={11}>
            <Table
              bordered
              size='small'
              scroll={
                viewingTx.outputs.length > 8
                  ? {y: 190}
                  : {}
              }
              pagination={false}
              dataSource={[...viewingTx.outputs]}
              columns={[
                {
                  title: this.t('wallet:to'),
                  dataIndex: 'address',
                  width: 290,
                  render: address => (
                    <p className='text-mono'>{address}</p>
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
          </Col>
        </Row>
      </Modal>
    )
  }
}
