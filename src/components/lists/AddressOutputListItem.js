import React from 'react'
import { observer } from 'mobx-react'

/** Ant Design */
import Checkbox from 'antd/lib/checkbox'

const AddressOutputListItem = observer(props => {
  const output = props.send.addrOutputs[props.index]
  return (
    <div className={'list-item-plain' + (props.index % 2 === 0 ? ' even' : '')}>
      <div className="flex-sb">
        <div>
          <Checkbox
            checked={output.checked === true}
            className="mono"
            disabled={output.color !== 'green' || output.spentTxid !== ''}
            id={output.txid + ':' + output.vout}
            onChange={props.setOutput}
          >
            {output.txid.slice(0, 11)}:{output.vout}
          </Checkbox>
        </div>
        <p className={output.spentTxid === '' ? output.color : 'red'}>
          {new Intl.NumberFormat(props.gui.language, {
            minimumFractionDigits: 6,
            maximumFractionDigits: 6
          }).format(output.amount)}
        </p>
      </div>
    </div>
  )
})

export default AddressOutputListItem
