import React from 'react'
import { translate } from 'react-i18next'
import { withRouter } from 'react-router-dom'
import { inject, observer } from 'mobx-react'

/** Ant Design */
import Menu from 'antd/lib/menu'

/** Required components. */
import WalletLock from './WalletLock'
import WalletUnlock from './WalletUnlock'

@translate(['wallet'], { wait: true })
@inject('connections', 'gui', 'rates', 'walletNext')
@observer
class Header extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.connections = props.connections
    this.gui = props.gui
    this.rates = props.rates
    this.wallet = props.walletNext
  }

  render () {
    const { average, local } = this.rates
    const { balance } = this.wallet.info

    return (
      <header className='flex-sb shadow'>
        <div className='flex' style={{ margin: '0 0 0 10px' }}>
          <img src='./assets/images/logoGrey.png' style={{ height: '26px' }} />
          <p style={{ margin: '0 15px 0 15px' }}>
            <span>
              {new Intl.NumberFormat(this.gui.language, {
                maximumFractionDigits: 6
              }).format(balance)}
            </span>{' '}
            XVC
          </p>
          <p style={{ margin: '0 15px 0 0' }}>
            ~{' '}
            <span>
              {new Intl.NumberFormat(this.gui.language, {
                maximumFractionDigits: 8
              }).format(balance * average)}
            </span>{' '}
            BTC
          </p>
          <p style={{ margin: '0 30px 0 0' }}>
            ~{' '}
            <span>
              {new Intl.NumberFormat(this.gui.language, {
                maximumFractionDigits: 2
              }).format(balance * average * local)}
            </span>{' '}
            {this.gui.localCurrency}
          </p>

          {this.wallet.info.unconfirmed > 0 && (
            <div style={{ margin: '0 15px 0 0' }}>
              <p>{this.t('wallet:pending')}</p>
              <p>
                <span>
                  {new Intl.NumberFormat(this.gui.language, {
                    maximumFractionDigits: 6
                  }).format(this.wallet.info.unconfirmed)}
                </span>{' '}
                XVC
              </p>
            </div>
          )}

          {this.wallet.info.newmint > 0 && (
            <div style={{ margin: '0 15px 0 0' }}>
              <p>{this.t('wallet:immature')}</p>
              <p>
                <span>
                  {new Intl.NumberFormat(this.gui.language, {
                    maximumFractionDigits: 6
                  }).format(this.wallet.info.newmint)}
                </span>{' '}
                XVC
              </p>
            </div>
          )}

          {this.wallet.info.stake > 0 && (
            <div>
              <p>{this.t('wallet:staking')}</p>
              <p>
                <span>
                  {new Intl.NumberFormat(this.gui.language, {
                    maximumFractionDigits: 6
                  }).format(this.wallet.info.stake)}
                </span>{' '}
                XVC
              </p>
            </div>
          )}
        </div>
        <div className='flex' style={{ margin: '0 10px 0 0' }}>
          <Menu
            defaultSelectedKeys={['/']}
            mode='horizontal'
            onClick={item => {
              this.props.history.push('/' + this.connections.viewing + item.key)
            }}
          >
            <Menu.Item key='/'>
              <i className='material-icons md-20'>account_balance_wallet</i>
            </Menu.Item>
            <Menu.Item key='/addresses'>
              <i className='material-icons md-20'>send</i>
            </Menu.Item>
            <Menu.Item key='/network'>
              <i className='material-icons md-20'>public</i>
            </Menu.Item>
            <Menu.Item key='/maintenance'>
              <i className='material-icons md-20'>settings</i>
            </Menu.Item>
          </Menu>
          {this.wallet.isEncrypted === true && (
            <div style={{ margin: '0 0 0 15px' }}>
              <WalletLock />
              <WalletUnlock />
            </div>
          )}
        </div>
      </header>
    )
  }
}

export default withRouter(Header)
