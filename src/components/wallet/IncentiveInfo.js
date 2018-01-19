import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'

/** Ant Design */
import Tooltip from 'antd/lib/tooltip'

@translate(['common'])
@inject('gui', 'wallet')
@observer
class IncentiveInfo extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.wallet = props.wallet
  }

  render() {
    const { info } = this.wallet
    const { walletaddress } = info

    return (
      <div style={{ lineHeight: '20px' }}>
        <Tooltip placement="bottom" title={this.t('addrDefault')}>
          <i className="flex-center material-icons md-16">account_circle</i>
        </Tooltip>
        <div style={{ margin: '10px 0 0 0' }}>
          <p className="flex-center" style={{ fontWeight: 500 }}>
            {walletaddress === '' ? this.t('unlockReveal') : walletaddress}
          </p>
        </div>
        <hr />
        <div className="flex-sb" style={{ padding: '0 10px 10px 10px' }}>
          <div>
            <div className="flex">
              <i className="material-icons md-16">gavel</i>
              <p>{this.t('voteCandidate')}</p>
            </div>
            <div className="flex">
              <i className="material-icons md-16">event_seat</i>
              <p>{this.t('collateralizedNodes')}</p>
            </div>
            <div className="flex">
              <i className="material-icons md-16">redeem</i>
              <p>{this.t('collateralBalance')}</p>
            </div>
          </div>
          <div style={{ fontWeight: 500, textAlign: 'right' }}>
            <p className={info.votecandidate === true ? 'green' : 'red'}>
              {this.t(info.votecandidate === true ? 'yes' : 'no')}
            </p>
            <p>
              {info.collateralized} / {info.endpoints.length}
            </p>
            <p>
              <span className={info.votecandidate === true ? 'green' : 'red'}>
                {new Intl.NumberFormat(this.gui.language, {
                  maximumFractionDigits: 6
                }).format(info.collateralbalance)}
              </span>{' '}
              /{' '}
              {new Intl.NumberFormat(this.gui.language).format(
                info.collateralrequired
              )}{' '}
              XVC
            </p>
          </div>
        </div>
      </div>
    )
  }
}

export default IncentiveInfo
