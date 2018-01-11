import React from 'react'
import List from 'react-list'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'

/** Component */
import AddressOutputListItem from './AddressOutputListItem.js'

@translate(['wallet'])
@inject('gui', 'send')
@observer
class AddressOutputList extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.send = props.send
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
    return (
      <div>
        <div className="flex-sb list-header">
          <p>{this.t('txId')}</p>
          <p>{this.t('amount')} (XVC)</p>
        </div>
        <div
          className="list-plain"
          style={{ maxHeight: this.gui.window.height - 502 }}
        >
          <List
            length={this.send.addrOutputs.length}
            itemRenderer={(index, key) => (
              <AddressOutputListItem
                index={index}
                key={key}
                gui={this.gui}
                send={this.send}
                setOutput={this.setOutput}
              />
            )}
          />
          {this.send.addrOutputs.length === 0 && (
            <div className="list-item-plain even">
              <div className="flex-center">
                <p>{this.t('addrUnused')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default AddressOutputList
