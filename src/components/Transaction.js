import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Col, Modal, Row } from 'antd'
import { Table, Column, Cell } from 'fixed-data-table'
import { tableHeight } from '../utilities/common'
import moment from 'moment'

/** Required components. */
import TableCell from './TableCell'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('rates', 'transactions') @observer

class Transaction extends React.Component {
  constructor (props) {
    super(props)
    this.rates = props.rates
    this.t = props.t
    this.transactions = props.transactions
    this.toggleModal = this.toggleModal.bind(this)
  }

  toggleModal () {
    this.transactions.setViewing()
  }

  render () {
    /** Destructure properties. */
    const {
      local,
      localCurrency,
      average
    } = this.rates

    const {
      viewing,
      viewingTx
    } = this.transactions

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
                <span className='text-dotted'>
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
                    <span className='text-dotted'>
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
                {moment(viewingTx.time).format('l - HH:mm:ss')}
                {' (' + moment().to(viewingTx.time)})
              </Col>
            </Row>
            {
              viewingTx.hasOwnProperty('blocktime') === true &&
              (
                <Row>
                  <Col span={1}>
                    <i className='material-icons md-18'>access_time</i>
                  </Col>
                  <Col span={4}>
                    {this.t('wallet:blockFound')}
                  </Col>
                  <Col span={19}>
                    {moment(viewingTx.blocktime).format('l - HH:mm:ss')}
                  </Col>
                </Row>
              )
            }
          </Col>
          <Col span={6} className='text-right'>
            <p>
              <a
                target='_blank'
                href={'https://explorer.vchain.info/tx/' + viewingTx.txid}
                disabled={viewingTx.hasOwnProperty('blockhash') === false}
              >
                {this.t('wallet:transactionOnExplorer')}
              </a>
            </p>
            <p>
              <a
                target='_blank'
                href={'https://explorer.vchain.info/block/' + viewingTx.blockhash}
                disabled={viewingTx.hasOwnProperty('blockhash') === false}
              >
                {this.t('wallet:blockOnExplorer')}
              </a>
            </p>
          </Col>
        </Row>
        <Row style={{margin: '15px 0 0 0'}} align='bottom' type='flex'>
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
                {viewingTx.amount.toFixed(6)} XVC (
                {(viewingTx.amount * local * average).toFixed(2)}
                {' ' + localCurrency})
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
                    {viewingTx.fee.toFixed(6)} XVC
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
                  <Col span={18} className='text-justify'>
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
                  <Col span={18} className='text-justify'>
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
              rowsCount={viewingTx.inputs.length}
              rowHeight={25}
              headerHeight={25}
              width={443}
              height={tableHeight(viewingTx.inputs.length, 275)}
            >
              <Column
                header={<Cell>{this.t('wallet:from')}</Cell>}
                cell={<TableCell data={viewingTx.inputs} column='address' />}
                width={300}
              />
              <Column
                header={<Cell>{this.t('wallet:amount')}</Cell>}
                cell={<TableCell data={viewingTx.inputs} column='value' />}
                width={143}
              />
            </Table>
          </Col>
          <Col span={2} className='text-center'>
            <i className='material-icons md-20'>forward</i>
          </Col>
          <Col span={11}>
            <Table
              rowsCount={viewingTx.outputs.length}
              rowHeight={25}
              headerHeight={25}
              width={443}
              height={tableHeight(viewingTx.outputs.length, 275)}
            >
              <Column
                header={<Cell>{this.t('wallet:to')}</Cell>}
                cell={<TableCell data={viewingTx.outputs} column='address' />}
                width={300}
              />
              <Column
                header={<Cell>{this.t('wallet:amount')}</Cell>}
                cell={<TableCell data={viewingTx.outputs} column='value' />}
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
