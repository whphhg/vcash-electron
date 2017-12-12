import React from 'react'
import { observer } from 'mobx-react'
import moment from 'moment'

const TransactionListItem = observer(props => {
  const tx = props.wallet.tx.get(props.search.tx[props.index])
  return (
    <div
      className={
        'list-item' +
        (props.index % 2 === 0 ? ' even' : '') +
        (props.wallet.viewing.tx === tx.txid ? ' selected' : '')
      }
      onClick={() => props.wallet.setViewing('tx', tx.txid)}
    >
      <div className="flex-sb">
        <p style={{ fontWeight: '500' }}>{props.t(tx.category)}</p>
        <p style={{ opacity: '0.6' }}>{moment(tx.time).fromNow()}</p>
      </div>
      <div className="flex-sb" style={{ fontWeight: '400' }}>
        <p className={tx.color}>
          {new Intl.NumberFormat(props.gui.language, {
            minimumFractionDigits: 6,
            maximumFractionDigits: 6
          }).format(tx.amount)}{' '}
          XVC
        </p>
        <p className={tx.color}>
          {new Intl.NumberFormat(props.gui.language, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(tx.amount * props.rates.average * props.rates.local)}{' '}
          {props.gui.localCurrency}
        </p>
      </div>
    </div>
  )
})

export default TransactionListItem
