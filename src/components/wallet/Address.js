import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'

/** Component */
import AddressOutputList from '../lists/AddressOutputList.js'

@translate(['common'])
@inject('wallet')
@observer
class Address extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.wallet = props.wallet
  }

  render() {
    /** Do not render if the address does not exist. */
    if (this.wallet.addr.has(this.wallet.viewing.addr) === false) return null
    const addr = this.wallet.addr.get(this.wallet.viewing.addr)

    return (
      <div>
        <div className="grid-lc gap-5-30">
          <div className="flex">
            <i className="material-icons md-16">call_received</i>
            <p>{this.t('received')}</p>
          </div>
          <p style={{ fontWeight: '500' }}>{addr.received}</p>
          <div className="flex">
            <i className="material-icons md-16">call_made</i>
            <p>{this.t('spent')}</p>
          </div>
          <p style={{ fontWeight: '500' }}>{addr.spent}</p>
          <div className="flex" style={{ alignItems: 'flex-start' }}>
            <i className="material-icons md-16">label</i>
            {addr.account === null && <p>{this.t('change')}</p>}
            {addr.account !== null && <p>{this.t('acc')}</p>}
          </div>
          {addr.account !== null && (
            <p style={{ fontWeight: '500' }}>
              {addr.account === '' ? this.t('default') : addr.account}
            </p>
          )}
        </div>
        <div style={{ margin: '20px 0 0 0' }}>
          <AddressOutputList />
        </div>
      </div>
    )
  }
}

export default Address
