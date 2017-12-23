import React from 'react'

const IoListItem = props => {
  const item = props.io[props.index]
  return (
    <div className={'list-item-plain' + (props.index % 2 === 0 ? ' even' : '')}>
      <div className="flex-sb">
        <p className="mono">{item.address}</p>
        <p className={item.color || ''} style={{ textAlign: 'right' }}>
          {new Intl.NumberFormat(props.gui.language, {
            minimumFractionDigits: 6,
            maximumFractionDigits: 6
          }).format(item.amount)}
        </p>
      </div>
    </div>
  )
}

export default IoListItem
