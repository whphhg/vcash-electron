import React from 'react'
import List from 'react-list'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'

/** Component */
import SpendOutputListItem from './SpendOutputListItem.js'

@translate(['wallet'])
@inject('gui', 'send', 'wallet')
@observer
class SpendOutputList extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.send = props.send
    this.wallet = props.wallet
  }

  /**
   * Mark or unmark the output for spending.
   * @function setOutput
   * @param {object} e - Checkbox element event.
   */
  setOutput = e => {
    this.send.setOutput(e.target.id)
  }

  render() {
    /** Do not render if there are no outputs marked for spending. */
    if (this.send.spend.utxo.length === 0) return null
    return (
      <div>
        <div className="flex-center list-header">
          <p>{this.t('selectedUtxo')}</p>
        </div>
        <div
          className="list-plain"
          style={{ maxHeight: this.gui.window.height - 502 }}
        >
          <List
            length={this.send.spend.utxo.length}
            itemRenderer={(index, key) => (
              <SpendOutputListItem
                index={index}
                key={key}
                gui={this.gui}
                send={this.send}
                wallet={this.wallet}
                setOutput={this.setOutput}
              />
            )}
          />
        </div>
      </div>
    )
  }
}

export default SpendOutputList
