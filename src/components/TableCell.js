import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Cell } from 'fixed-data-table'
import moment from 'moment'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('ui') @observer

class TableCell extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.ui = props.ui
    this.props = props
  }

  render () {
    const { rowIndex, data, column, type, extra } = this.props

    switch (type) {
      case 'localAmount':
        return (
          <Cell
            {...this.props}
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
                  <Cell {...this.props}>
                    <i>{this.t('wallet:multipleAccounts')}</i>
                  </Cell>
                )

              case '':
                return (
                  <Cell {...this.props}>
                    <i>{this.t('wallet:default')}</i>
                  </Cell>
                )

              default:
                return (
                  <Cell {...this.props}>
                    {data[rowIndex][column]}
                  </Cell>
                )
            }

          case 'address':
            return (
              <Cell {...this.props} className='text-mono'>
                {data[rowIndex][column]}
              </Cell>
            )

          case 'amount':
            return (
              <Cell
                {...this.props}
                className={'text-right ' + data[rowIndex]['color']}
              >
                {
                  new Intl.NumberFormat(this.ui.language, {
                    minimumFractionDigits: 6,
                    maximumFractionDigits: 6
                  }).format(data[rowIndex][column])
                } XVC
              </Cell>
            )

          case 'banscore':
            return (
              <Cell {...this.props}>
                {data[rowIndex][column]}/100
              </Cell>
            )

          case 'conntime':
            return (
              <Cell {...this.props}>
                {moment(data[rowIndex][column]).fromNow()}
              </Cell>
            )

          case 'time':
            return (
              <Cell {...this.props}>
                {moment(data[rowIndex][column]).format('l - HH:mm:ss')}
              </Cell>
            )

          case 'value':
            return (
              <Cell {...this.props}>
                {
                  new Intl.NumberFormat(this.ui.language, {
                    minimumFractionDigits: 6,
                    maximumFractionDigits: 6
                  }).format(data[rowIndex][column])
                } XVC
              </Cell>
            )

          default:
            return (
              <Cell {...this.props}>
                {data[rowIndex][column]}
              </Cell>
            )
        }
    }
  }
}

export default TableCell
