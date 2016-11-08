import React from 'react'
import { Cell } from 'fixed-data-table'
import moment from 'moment'

/** Dynamic fixed-data-table cell creation component. */
const TableCell = ({ rowIndex, data, column, type, extra, ...props }) => {
  switch (type) {
    case 'localAmount':
      return (
        <Cell {...props} className='fdt-last-column'>{parseFloat(data[rowIndex][column]).toFixed(2)} {extra}</Cell>
      )

    default:
      switch (column) {
        case 'account':
          if (data[rowIndex][column] === '') {
            return (
              <Cell {...props}><i>Default</i></Cell>
            )
          } else {
            return (
              <Cell {...props}>{data[rowIndex][column]}</Cell>
            )
          }

        case 'address':
          return (
            <Cell {...props} className='text-mono'>{data[rowIndex][column]}</Cell>
          )

        case 'amount':
          return (
            <Cell {...props} className='text-right'>{parseFloat(data[rowIndex][column]).toFixed(6)} XVC</Cell>
          )

        case 'time':
          return (
            <Cell {...props}>{moment(new Date(data[rowIndex][column] * 1000)).format('YYYY-MM-DD - HH:mm:ss')}</Cell>
          )

        case 'conntime':
          return (
            <Cell {...props}>{moment(data[rowIndex][column]).fromNow()}</Cell>
          )

        case 'banscore':
          return (
            <Cell {...props}>{data[rowIndex][column]}/100</Cell>
          )

        default:
          return (
            <Cell {...props}>{data[rowIndex][column]}</Cell>
          )
      }
  }
}

export default TableCell
