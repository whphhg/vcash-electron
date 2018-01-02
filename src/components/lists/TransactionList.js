import React from 'react'
import List from 'react-list'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'

/** Components */
import TransactionListItem from './TransactionListItem.js'
import { Placeholder } from '../utilities/Common.js'

@translate(['wallet'])
@inject('gui', 'rates', 'search', 'wallet')
@observer
class TransactionList extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.rates = props.rates
    this.search = props.search
    this.wallet = props.wallet
  }

  render() {
    return (
      <div className="list" style={{ maxHeight: this.gui.window.height - 87 }}>
        <List
          length={this.search.tx.length}
          itemRenderer={(index, key) => (
            <TransactionListItem
              index={index}
              key={key}
              t={this.t}
              gui={this.gui}
              rates={this.rates}
              search={this.search}
              wallet={this.wallet}
            />
          )}
        />
        <Placeholder
          t={this.t}
          icon="face"
          string="welcomeNew"
          style={{ minHeight: '100%' }}
          wallet={this.wallet}
        />
      </div>
    )
  }
}

export default TransactionList
