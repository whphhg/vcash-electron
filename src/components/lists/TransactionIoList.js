import React from 'react'
import List from 'react-list'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'

/** Component */
import TransactionIoListItem from './TransactionIoListItem.js'

@translate(['wallet'])
@inject('gui', 'wallet')
@observer
class TransactionIoList extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.wallet = props.wallet

    /** IO array and IO type (vin or vout). */
    this.io = props.io
    this.type = props.type
  }

  /** Update io prop on transaction change. */
  componentWillReceiveProps(nextProps) {
    this.io = nextProps.io
  }

  render() {
    return (
      <div>
        <div className="flex-sb list-header">
          <p>{this.t(this.type === 'vin' ? 'from' : 'to')}</p>
          <p>{this.t('amount')} (XVC)</p>
        </div>
        <div
          className="list-plain"
          style={{ maxHeight: this.gui.window.height - 544 }}
        >
          <List
            length={this.io.length}
            itemRenderer={(index, key) => (
              <TransactionIoListItem
                index={index}
                key={key}
                gui={this.gui}
                io={this.io}
              />
            )}
          />
          {this.type === 'vin' &&
            this.io.length === 0 && (
              <div className="list-item-plain even">
                <div className="flex-center">
                  <p>Coinbase</p>
                </div>
              </div>
            )}
        </div>
      </div>
    )
  }
}

export default TransactionIoList
