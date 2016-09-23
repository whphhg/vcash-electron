import React from 'react'
import { Cell } from 'fixed-data-table'
import moment from 'moment'

const TableCell = ({ rowIndex, data, column, localCurrency, ...props }) => {
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

    case 'conntime':
      return (
        <Cell {...props}>
          {moment(data[rowIndex][column]).fromNow()}
        </Cell>
      )

    case 'banscore':
      return (
        <Cell {...props}>
          {data[rowIndex][column]}/100
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

export default TableCell
