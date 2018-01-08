import React from 'react'
import { observer } from 'mobx-react'

const AddressListItem = observer(props => {
  const addr = props.wallet.addr.get(props.search.addr[props.index])
  return (
    <div
      className={
        'list-item' +
        (props.index % 2 === 0 ? ' even' : '') +
        (props.wallet.viewing.addr === addr.address ? ' selected' : '')
      }
      onClick={() => props.wallet.setViewing('addr', addr.address)}
    >
      <div className="mono" style={{ fontWeight: '400', opacity: '0.7' }}>
        <p
          className="flex-center"
          style={{ letterSpacing: addr.address.length === 34 ? '0.22px' : 0 }}
        >
          {addr.address}
        </p>
      </div>
      <div className={'flex-center' + (addr.balance > 0 ? ' green' : '')}>
        <p style={{ fontWeight: '500' }}>
          {new Intl.NumberFormat(props.gui.language, {
            minimumFractionDigits: 6,
            maximumFractionDigits: 6
          }).format(Math.abs(addr.balance))}{' '}
          XVC
        </p>
      </div>
    </div>
  )
})

export default AddressListItem
