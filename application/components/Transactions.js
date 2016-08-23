import React from 'react'
import { inject, observer } from 'mobx-react'
import { v4 } from 'node-uuid'
import moment from 'moment'
import { Table, Column, Cell } from 'fixed-data-table'
import { Textfield, Grid, Cell as GridCell } from 'react-mdl'


import { Switch, Icon as IconA } from 'antd'

import ChainBlender from './ChainBlender'
import TransactionsChart from './TransactionsChart'

const CreateCell = ({ rowIndex, data, column, localCurrency, ...props }) => {
  switch (column) {
    case 'amount':
      return (
        <Cell {...props}>
          {parseFloat(data[rowIndex][column]).toFixed(6)}
        </Cell>
      )

    case 'amountLocal':
      return (
        <Cell {...props}>
          {parseFloat(data[rowIndex][column]).toFixed(2)} {localCurrency}
        </Cell>
      )

    case 'time':
      return (
        <Cell {...props}>
          {moment(new Date(data[rowIndex][column] * 1000)).format('YYYY-MM-DD - HH:mm:ss')}
        </Cell>
      )

    default:
      return (
        <Cell {...props}>
          {data[rowIndex][column]}
        </Cell>
      )
  }
}

/**
 * TODO: Colorize amounts according to category.
 */
@inject('transaction')
@inject('transactions')
@inject('rates')
@inject('wallet')
@observer

class Transactions extends React.Component {
  constructor(props) {
    super(props)
    this.transaction = props.transaction
    this.transactions = props.transactions
    this.rates = props.rates
    this.wallet = props.wallet
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

  setShowCategory(event, index, value) {
    this.transactions.setShowCategory(value)
  }

  toggleTransaction(rowNumber, columndId) {
    const txid = this.transactions.filtered[rowNumber].txid
    this.transaction.setTxid(txid)
    this.transaction.toggleDialog()
  }

  render() {
    return (
      <div>
        <Grid shadow={1}>
          <GridCell col={3}>
            <Textfield
              onChange={this.setFilters}
              label='Filter transactions'
              expandable
              expandableIcon='search'
            />
          </GridCell>
          <GridCell col={9}>
            <ChainBlender />

          <Switch checkedChildren={<IconA type="check" />} unCheckedChildren={<IconA type="cross" />} />

                  <p>Unconfirmed <span>{this.transactions.amountUnconfirmed.toFixed(6)}</span> XVC</p>

                  {
                    this.wallet.stake === 0 &&
                    (
                      <p>Staking <span>{this.wallet.stake.toFixed(6)}</span> XVC</p>
                    )
                  }

                  {
                    this.wallet.newmint === 0 &&
                    (
                      <p>Immature <span>{this.wallet.newmint.toFixed(6)}</span> XVC</p>
                    )
                  }

          </GridCell>

          <GridCell col={12}>
            <Table
              rowHeight={50}
              headerHeight={50}
              rowsCount={this.transactions.filtered.length}
              width={1100}
              height={250}
            >
              <Column
                header={<Cell>Date</Cell>}
                cell={<CreateCell data={this.transactions.filtered} column='time' />}
                width={200}
              />
              <Column
                header={<Cell>Account</Cell>}
                cell={<CreateCell data={this.transactions.filtered} column='account' />}
                width={200}
              />
              <Column
                header={<Cell>Address</Cell>}
                cell={<CreateCell data={this.transactions.filtered} column='address' />}
                width={340}
              />
              <Column
                header={<Cell>Category</Cell>}
                cell={<CreateCell data={this.transactions.filtered} column='category' />}
                width={100}
              />
              <Column
                header={<Cell>Amount</Cell>}
                cell={<CreateCell data={this.transactions.filtered} column='amount' />}
                width={150}
              />
              <Column
                header={<Cell>{this.rates.localCurrency}</Cell>}
                cell={<CreateCell data={this.transactions.filtered} column='amountLocal' localCurrency={this.rates.localCurrency} />}
                width={150}
              />
            </Table>
          </GridCell>
        </Grid>

        <TransactionsChart />
      </div>
    )
  }
}

export default Transactions
