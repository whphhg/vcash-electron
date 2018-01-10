import React from 'react'
import { observer } from 'mobx-react'

/** Ant Design */
import Checkbox from 'antd/lib/checkbox'

const SpendOutputListItem = observer(props => {
  const utxo = props.send.spendUtxo[props.index]
  return (
    <div className={'list-item-plain' + (props.index % 2 === 0 ? ' even' : '')}>
      <div className="flex-sb">
        <div>
          <Checkbox
            checked
            className="mono"
            id={utxo.txid + ':' + utxo.vout}
            onChange={props.setOutput}
          >
            {utxo.txid.slice(0, 11)}:{utxo.vout}
          </Checkbox>
        </div>
        <p className="green">
          {new Intl.NumberFormat(props.gui.language, {
            minimumFractionDigits: 6,
            maximumFractionDigits: 6
          }).format(utxo.amount)}
        </p>
      </div>
    </div>
  )
})

export default SpendOutputListItem
