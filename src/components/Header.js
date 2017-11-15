import React from 'react'
import { translate } from 'react-i18next'
import { withRouter } from 'react-router-dom'
import { inject, observer } from 'mobx-react'

/** Ant Design */
import Popover from 'antd/lib/popover'

/** Components */
import WalletLock from './WalletLock'
import WalletUnlock from './WalletUnlock'

@translate(['wallet'])
@inject('connections', 'gui', 'rates', 'wallet')
@observer
class Header extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.connections = props.connections
    this.gui = props.gui
    this.rates = props.rates
    this.wallet = props.wallet
  }

  render() {
    const { average, local } = this.rates

    return (
      <div className="flex-sb" id="Header">
        <div className="flex">
          <i className="material-icons md-18">account_balance</i>
          <p className="flex">
            <span style={{ margin: '0 4px 0 3px' }}>
              {new Intl.NumberFormat(this.gui.language, {
                maximumFractionDigits: 6
              }).format(this.wallet.info.balance)}
            </span>
            XVC
          </p>
          <p className="flex" style={{ margin: '0 15px 0 15px' }}>
            ~
            <span>
              {new Intl.NumberFormat(this.gui.language, {
                maximumFractionDigits: 8
              }).format(this.wallet.info.balance * average)}
            </span>
            BTC
          </p>
          <p className="flex">
            ~
            <span>
              {new Intl.NumberFormat(this.gui.language, {
                maximumFractionDigits: 2
              }).format(this.wallet.info.balance * average * local)}
            </span>
            {this.gui.localCurrency}
          </p>
        </div>
        <div className="flex">
          {this.wallet.pending > 0 && (
            <Popover
              content={
                <div style={{ minWidth: '200px' }}>
                  {this.wallet.info.unconfirmed > 0 && (
                    <div className="flex-sb">
                      <p>{this.t('unconfirmed')}</p>
                      <p>
                        <span style={{ fontWeight: 500 }}>
                          {new Intl.NumberFormat(this.gui.language, {
                            maximumFractionDigits: 6
                          }).format(this.wallet.info.unconfirmed)}
                        </span>{' '}
                        XVC
                      </p>
                    </div>
                  )}

                  {this.wallet.info.stake > 0 && (
                    <div className="flex-sb">
                      <p>{this.t('staking')}</p>
                      <p>
                        <span style={{ fontWeight: 500 }}>
                          {new Intl.NumberFormat(this.gui.language, {
                            maximumFractionDigits: 6
                          }).format(this.wallet.info.stake)}
                        </span>{' '}
                        XVC
                      </p>
                    </div>
                  )}

                  {this.wallet.info.newmint > 0 && (
                    <div className="flex-sb">
                      <p>{this.t('immature')}</p>
                      <p>
                        <span style={{ fontWeight: 500 }}>
                          {new Intl.NumberFormat(this.gui.language, {
                            maximumFractionDigits: 6
                          }).format(this.wallet.info.newmint)}
                        </span>{' '}
                        XVC
                      </p>
                    </div>
                  )}
                </div>
              }
              placement="bottomRight"
              trigger="hover"
            >
              <div className="flex" style={{ margin: '0 15px 0 0' }}>
                <i className="material-icons md-18">access_time</i>
                <p className="flex">
                  {this.t('pending')}
                  <span style={{ margin: '0 4px 0 6px' }}>
                    {new Intl.NumberFormat(this.gui.language, {
                      maximumFractionDigits: 6
                    }).format(this.wallet.pending)}
                  </span>
                  XVC
                </p>
              </div>
            </Popover>
          )}

          {this.wallet.isEncrypted === true && (
            <div>
              <WalletLock />
              <WalletUnlock />
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default withRouter(Header)
