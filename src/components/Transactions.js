import React from 'react'
import { inject, observer } from 'mobx-react'
import { Button, Col, Input, Radio, Row } from 'antd'
import { Table, Column, Cell } from 'fixed-data-table'
import { tableHeight } from '../utilities/common'

/** Required components. */
import TableCell from './TableCell'
import ChainBlender from './ChainBlender'
import CurrencyConverter from './CurrencyConverter'
import TransactionsChart from './TransactionsChart'

/** Make the component reactive and inject MobX stores. */
@inject('rates', 'transaction', 'transactions') @observer

class Transactions extends React.Component {
  constructor(props) {
    super(props)
    this.transaction = props.transaction
    this.transactions = props.transactions
    this.rates = props.rates
    this.filtersUpdateTimer = null
    this.setFilters = this.setFilters.bind(this)
    this.setShowCategory = this.setShowCategory.bind(this)
    this.toggleTransaction = this.toggleTransaction.bind(this)
  }

  setFilters(event) {
    clearTimeout(this.filtersUpdateTimer)
    const filter = event.target.value

    this.filtersUpdateTimer = setTimeout(() => {
      this.transactions.setFilters(filter)
    }, 0.5 * 1000)
  }

  setShowCategory(event) {
    this.transactions.setShowCategory(event.target.value)
  }

  toggleTransaction(rowNumber, columndId) {
    const txid = this.transactions.list[rowNumber].txid
    this.transaction.setTxid(txid)
    this.transaction.toggleDialog()
  }

  render() {
    return (
      <div>
        <Row className='shadow'>
          <div className='toolbar'>
          <Col span={6}>
            <ChainBlender />
            <CurrencyConverter />
          </Col>
          <Col span={12} className='text-center'>
            <Radio.Group defaultValue={this.transactions.showCategory} onChange={this.setShowCategory}>
              <Radio.Button value="all">All</Radio.Button>
              <Radio.Button value="0">Received</Radio.Button>
              <Radio.Button value="1">Sent</Radio.Button>
              <Radio.Button value="2">Generated</Radio.Button>
            </Radio.Group>
          </Col>
          <Col span={6}>
            <Input
              onChange={this.setFilters}
              placeholder='Filter transactions'
              addonAfter={<i className='material-icons md-16'>search</i>}
            />
          </Col>
          </div>
        </Row>
        <Row>
          <Col span={24}>
            <div className='shadow-2'>
              <div id='transactions'>
                <Table
                  rowsCount={this.transactions.filtered.length}
                  rowHeight={25}
                  headerHeight={25}
                  width={1130}
                  height={tableHeight(this.transactions.filtered.length, 417)}
                >
                  <Column
                    header={<Cell>Date</Cell>}
                    cell={<TableCell data={this.transactions.filtered} column='time' />}
                    width={145}
                  />
                  <Column
                    header={<Cell>Type</Cell>}
                    cell={<TableCell data={this.transactions.filtered} column='type' />}
                    width={160}
                  />
                  <Column
                    header={<Cell>Account</Cell>}
                    cell={<TableCell data={this.transactions.filtered} column='confirmations' />}
                    width={80}
                  />
                  <Column
                    header={<Cell>Address</Cell>}
                    cell={<TableCell data={this.transactions.filtered} column='txid' />}
                    width={285}
                  />
                  <Column
                    header={<Cell>Amount</Cell>}
                    cell={<TableCell data={this.transactions.filtered} column='amount' />}
                    width={150}
                  />
                  <Column
                    header={<Cell>{this.rates.localCurrency}</Cell>}
                    cell={
                      <TableCell
                        data={this.transactions.filtered}
                        column='amountLocal'
                        type='localAmount'
                        extra={this.rates.localCurrency}
                      />
                    }
                    width={150}
                  />
                </Table>
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <TransactionsChart />
          </Col>
        </Row>
      </div>
    )
  }
}

export default Transactions
