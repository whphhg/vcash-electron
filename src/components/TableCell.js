import React from 'react'
import { Cell } from 'fixed-data-table'
import moment from 'moment'
import i18next from '../utilities/i18next'

/** Required stores. */
import ui from '../stores/ui'

/** Dynamic fixed-data-table cell creation component. */
const TableCell = ({ rowIndex, data, column, type, extra, ...props }) => {
  switch (type) {
    case 'localAmount':
      return (
        <Cell
          {...props}
          className={'fdt-last-column ' + data[rowIndex]['color']}
        >
          {data[rowIndex][column]} {extra}
        </Cell>
      )

    default:
      switch (column) {
        case 'account':
          switch (data[rowIndex][column]) {
            case '*':
              return (
                <Cell {...props}>
                  <i>{i18next.t('wallet:multipleAccounts')}</i>
                </Cell>
              )

            case '':
              return (
                <Cell {...props}>
                  <i>{i18next.t('wallet:default')}</i>
                </Cell>
              )

            default:
              return (
                <Cell {...props}>
                  {data[rowIndex][column]}
                </Cell>
              )
          }

        case 'address':
          return (
            <Cell {...props} className='text-mono'>
              {data[rowIndex][column]}
            </Cell>
          )

        case 'amount':
          return (
            <Cell
              {...props}
              className={'text-right ' + data[rowIndex]['color']}
            >
              {
                new Intl.NumberFormat(ui.language, {
                  minimumFractionDigits: 6,
                  maximumFractionDigits: 6
                }).format(data[rowIndex][column])
              } XVC
            </Cell>
          )

        case 'banscore':
          return (
            <Cell {...props}>
              {data[rowIndex][column]}/100
            </Cell>
          )

        case 'conntime':
          return (
            <Cell {...props}>
              {moment(data[rowIndex][column]).fromNow()}
            </Cell>
          )

        case 'time':
          return (
            <Cell {...props}>
              {moment(data[rowIndex][column]).format('l - HH:mm:ss')}
            </Cell>
          )

        case 'value':
          return (
            <Cell {...props}>
              {
                new Intl.NumberFormat(ui.language, {
                  minimumFractionDigits: 6,
                  maximumFractionDigits: 6
                }).format(data[rowIndex][column])
              } XVC
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
}

export default TableCell
