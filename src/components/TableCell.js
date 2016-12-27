import React from 'react'
import { Cell } from 'fixed-data-table'
import moment from 'moment'

/** Dynamic fixed-data-table cell creation component. */
const TableCell = ({ rowIndex, data, column, type, extra, ...props }) => {
  switch (type) {
    case 'localAmount':
      return (
        <Cell {...props} className={'fdt-last-column ' + (data[rowIndex][column] > 0 ? 'green' : 'red')}>
          {parseFloat(data[rowIndex][column]).toFixed(2)} {extra}
        </Cell>
      )

    default:
      switch (column) {
        case 'account':
          switch (data[rowIndex][column]) {
            case '*':
              return (
                <Cell {...props}><i>Multiple</i></Cell>
              )

            case '':
              return (
                <Cell {...props}><i>Default</i></Cell>
              )

            default:
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
            <Cell {...props} className={'text-right ' + (data[rowIndex][column] > 0 ? 'green' : 'red')}>
              {parseFloat(data[rowIndex][column]).toFixed(6)} XVC
            </Cell>
          )

        case 'value':
          return (
            <Cell {...props}>
              {parseFloat(data[rowIndex][column]).toFixed(6)} XVC
            </Cell>
          )

        case 'time':
          return (
            <Cell {...props}>{moment(new Date(data[rowIndex][column])).format('YYYY-MM-DD - HH:mm:ss')}</Cell>
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
