import React from 'react'

/** Required components. */
import LocalCurrency from './LocalCurrency'
import WalletBackup from './WalletBackup'
import WalletDump from './WalletDump'
import WalletSeedDump from './WalletSeedDump'

/**
 * TODO: Implement wallet check and repair.
 * TODO: Implement wallet passphrase change.
 */
class Maintenance extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className='toolbar'>
        <div className='left'>
          <WalletBackup />
          <WalletDump />
          <WalletSeedDump />
        </div>
        <div className='right'>
          <p>Set local currency</p>
          <LocalCurrency />
        </div>
      </div>
    )
  }
}

export default Maintenance
