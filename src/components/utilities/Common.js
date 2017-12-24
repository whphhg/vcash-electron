import React from 'react'

/**
 * Placeholder used in Transactions screen while the wallet has 0 transactions.
 * @function Placeholder
 * @prop {object} t - i18next intance.
 * @prop {string} icon - Material icon name.
 * @prop {object} style - Custom component style.
 * @prop {string} string - i18next namespace string.
 * @prop {object} wallet - Connection instance Wallet store.
 */
export const Placeholder = props => {
  if (props.wallet.txKeys.length > 0) return null
  return (
    <div className="flex-center" style={props.style}>
      <div style={{ textAlign: 'center' }}>
        <i className="material-icons md-40">{props.icon}</i>
        <p style={{ fontSize: '16px', margin: '10px 0 0 0' }}>
          {props.t(props.string)}
        </p>
      </div>
    </div>
  )
}

/**
 * Switch icon.
 * @function SwitchIcon
 * @prop {string} icon - Material icon name.
 */
export const SwitchIcon = props => (
  <div style={{ margin: '-2px 0 0 0' }}>
    <i className="material-icons md-16">{props.icon}</i>
  </div>
)
