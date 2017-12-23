import React from 'react'
import List from 'react-list'
import { translate } from 'react-i18next'
import { computed } from 'mobx'
import { inject, observer } from 'mobx-react'

/** Component */
import IoListItem from './IoListItem'

@translate(['wallet'])
@inject('gui', 'wallet')
@observer
class IoList extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.wallet = props.wallet

    /** ListItem type (vin or vout). */
    this.type = props.type
  }

  /**
   * Cleanup and normalize vin and vout arrays.
   * @function io
   * @return {array} Inputs and outputs.
   */
  @computed
  get io() {
    if (this.wallet.tx.has(this.wallet.viewing.tx) === false) return null
    const tx = this.wallet.tx.get(this.wallet.viewing.tx)

    /** Prepare inputs and remove coinbase (PoW) if present. */
    const vin = tx.vin.reduce((vin, input) => {
      if ('coinbase' in input === true) return vin

      vin.push({ address: input.address, amount: input.value })
      return vin
    }, [])

    /** Prepare outputs and remove nonstandard (PoS) if present. */
    const vout = tx.vout.reduce((vout, output) => {
      if (output.scriptPubKey.type === 'nonstandard') return vout

      vout.push({
        address: output.scriptPubKey.addresses[0],
        amount: output.value
      })

      /** Add color prop indicating if the output is spendable or spent. */
      if ('spentTxid' in output === true) {
        vout[vout.length - 1].color = output.spentTxid === '' ? 'green' : 'red'
      }

      return vout
    }, [])

    return { vin, vout }
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
          style={{ maxHeight: this.gui.window.height - 492 }}
        >
          <List
            length={this.io[this.type].length}
            itemRenderer={(index, key) => (
              <IoListItem
                index={index}
                key={key}
                type={this.type}
                io={this.io[this.type]}
                gui={this.gui}
              />
            )}
          />
          {this.type === 'vin' &&
            this.io.vin.length === 0 && (
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

export default IoList
