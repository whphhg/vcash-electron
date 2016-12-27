import React from 'react'
import { inject, observer } from 'mobx-react'
import { Col, Modal, Row } from 'antd'
import { Table, Column, Cell } from 'fixed-data-table'
import { tableHeight } from '../utilities/common'
import moment from 'moment'

/** Required components. */
import TableCell from './TableCell'

/** Make the component reactive and inject MobX stores. */
@inject('rates', 'transactions') @observer

class Transaction extends React.Component {
  constructor (props) {
    super(props)
    this.rates = props.rates
    this.transactions = props.transactions
    this.toggleDialog = this.toggleDialog.bind(this)
  }

  toggleDialog () {
    this.transactions.setViewingTxid()
  }

  render () {
    if (this.transactions.viewingTxid === null) return null
    return (
      <Modal
        title='Transaction details'
        width={1000}
        visible={this.transactions.viewingTxid !== ''}
        onCancel={this.toggleDialog}
        footer={null}
      >
        <Row>
          <Col span={16}>
            <Row>
              <Col span={6}>
                <Row>
                  <Col span={5}><i className='material-icons md-18'>label</i></Col>
                  <Col span={19}>Transaction ID</Col>
                </Row>
              </Col>
              <Col span={18}>
                <span className='text-dotted'>{this.transactions.viewingTx.txid}</span>
              </Col>
            </Row>
            {
              this.transactions.viewingTx.hasOwnProperty('blockhash') === true &&
              (
                <Row>
                  <Col span={6}>
                    <Row>
                      <Col span={5}><i className='material-icons md-18'>extension</i></Col>
                      <Col span={19}>Included in block</Col>
                    </Row>
                  </Col>
                  <Col span={18}>
                    <span className='text-dotted'>{this.transactions.viewingTx.blockhash}</span>
                  </Col>
                </Row>
              )
            }
            <Row>
              <Col span={6}>
                <Row>
                  <Col span={5}><i className='material-icons md-18'>access_time</i></Col>
                  <Col span={19}>Relayed on</Col>
                </Row>
              </Col>
              <Col span={18}>
                {moment(new Date(this.transactions.viewingTx.time)).format('YYYY-MM-DD [at] HH:mm:ss')} ({moment().to(this.transactions.viewingTx.time)})
              </Col>
            </Row>
            {
              this.transactions.viewingTx.hasOwnProperty('blocktime') === true &&
              (
                <Row>
                  <Col span={6}>
                    <Row>
                      <Col span={5}><i className='material-icons md-18'>access_time</i></Col>
                      <Col span={19}>Block {this.transactions.viewingTx.blockhash.substring(0, 4) === '0000' ? 'mined' : 'minted'} on</Col>
                    </Row>
                  </Col>
                  <Col span={18}>
                    {moment(new Date(this.transactions.viewingTx.blocktime)).format('YYYY-MM-DD [at] HH:mm:ss')}
                  </Col>
                </Row>
              )
            }
            <Row style={{margin: '15px 0 0 0'}}>
              <Col span={6}>
                <Row>
                  <Col span={5}><i className='material-icons md-18'>visibility</i></Col>
                  <Col span={19}>Status</Col>
                </Row>
              </Col>
              <Col span={18}>
                {this.transactions.viewingTx.status}
              </Col>
            </Row>
            <Row>
              <Col span={6}>
                <Row>
                  <Col span={5}><i className='material-icons md-18'>credit_card</i></Col>
                  <Col span={19}>Amount</Col>
                </Row>
              </Col>
              <Col span={18}>
                <span className={this.transactions.viewingTx.amount > 0 ? 'green' : 'red'}>
                  {this.transactions.viewingTx.amount.toFixed(6)} XVC ~ {(this.transactions.viewingTx.amount * this.rates.local * this.rates.average).toFixed(2)} {this.rates.localCurrency}
                </span>
              </Col>
            </Row>
            {
              this.transactions.viewingTx.hasOwnProperty('fee') === true && (
                <Row>
                  <Col span={6}>
                    <Row>
                      <Col span={5}><i className='material-icons md-18'>card_giftcard</i></Col>
                      <Col span={19}>Fee</Col>
                    </Row>
                  </Col>
                  <Col span={18} className='red'>
                    {this.transactions.viewingTx.fee.toFixed(6)} XVC
                  </Col>
                </Row>
              )
            }
            <Row>
              <Col span={6}>
                <Row>
                  <Col span={5}><i className='material-icons md-18'>done_all</i></Col>
                  <Col span={19}>Confirmations</Col>
                </Row>
              </Col>
              <Col span={18}>
                <span
                  className={
                    this.transactions.viewingTx.confirmations === 0 ||
                    this.transactions.viewingTx.hasOwnProperty('generated') === true &&
                    this.transactions.viewingTx.confirmations < 220
                      ? 'red'
                      : 'green'
                  }
                >
                  {this.transactions.viewingTx.confirmations}
                </span>
              </Col>
            </Row>
          </Col>
          <Col span={8} className='text-right'>
            <p>
              <a
                target='_blank'
                href={'https://explorer.vchain.info/tx/' + this.transactions.viewingTx.txid}
                disabled={this.transactions.viewingTx.hasOwnProperty('blockhash') === false}
              >
                View transaction on explorer
              </a>
            </p>
            <p>
              <a
                target='_blank'
                href={'https://explorer.vchain.info/block/' + this.transactions.viewingTx.blockhash}
                disabled={this.transactions.viewingTx.hasOwnProperty('blockhash') === false}
              >
                View block on explorer
              </a>
            </p>
          </Col>
        </Row>
        <Row style={{margin: '15px 0 0 0'}}>
          <Col span={11}>
            <Table
              rowsCount={this.transactions.viewingTx.inputs.length}
              rowHeight={25}
              headerHeight={25}
              width={443}
              height={tableHeight(this.transactions.viewingTx.inputs.length, 224)}
            >
              <Column
                header={<Cell>From</Cell>}
                cell={<TableCell data={this.transactions.viewingTx.inputs} column='address' />}
                width={300}
              />
              <Column
                header={<Cell>Amount</Cell>}
                cell={<TableCell data={this.transactions.viewingTx.inputs} column='value' />}
                width={143}
              />
            </Table>
          </Col>
          <Col span={2} className='text-center'><i className='material-icons md-20'>forward</i></Col>
          <Col span={11}>
            <Table
              rowsCount={this.transactions.viewingTx.outputs.length}
              rowHeight={25}
              headerHeight={25}
              width={443}
              height={tableHeight(this.transactions.viewingTx.outputs.length, 224)}
            >
              <Column
                header={<Cell>To</Cell>}
                cell={<TableCell data={this.transactions.viewingTx.outputs} column='address' />}
                width={300}
              />
              <Column
                header={<Cell>Amount</Cell>}
                cell={<TableCell data={this.transactions.viewingTx.outputs} column='value' />}
                width={143}
              />
            </Table>
          </Col>
        </Row>
      </Modal>
    )
  }
}

export default Transaction
