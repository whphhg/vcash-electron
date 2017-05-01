import React from 'react'
import { translate } from 'react-i18next'
import { withRouter } from 'react-router-dom'
import { inject, observer } from 'mobx-react'
import { Menu } from 'antd'

/** Required components. */
import WalletLock from './WalletLock'
import WalletUnlock from './WalletUnlock'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('connections', 'gui', 'info', 'rates', 'wallet') @observer

class Header extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.connections = props.connections
    this.gui = props.gui
    this.info = props.info
    this.rates = props.rates
    this.wallet = props.wallet
  }

  render () {
    const { local, average } = this.rates
    const { balance, newmint, stake } = this.info.wallet

    return (
      <header className='flex-sb shadow' style={{height: '55px'}}>
        <div
          className='flex'
          style={{alignItems: 'flex-end', justifyContent: 'flex-start'}}
        >
          <img
            src='./assets/images/logoGrey.png'
            style={{height: '36px', margin: '0 10px 0 10px', width: '36px'}}
          />
          <div style={{margin: '0 10px 0 5px'}}>
            <p>{this.t('wallet:balance')}</p>
            <p><span style={{fontWeight: '600'}}>
              {
                new Intl.NumberFormat(this.gui.language, {
                  maximumFractionDigits: 6
                }).format(balance)
              }
            </span> XVC</p>
          </div>
          <div style={{margin: '0 10px 0 0'}}>
            <p>~<span style={{fontWeight: '600'}}>
              {
                new Intl.NumberFormat(this.gui.language, {
                  maximumFractionDigits: 8
                }).format(balance * average)
              }
            </span> BTC</p>
          </div>
          <div style={{margin: '0 20px 0 0'}}>
            <p>~<span style={{fontWeight: '600'}}>
              {
                new Intl.NumberFormat(this.gui.language, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }).format(balance * average * local)
              }
            </span> {this.gui.localCurrency}</p>
          </div>
          {
            this.wallet.pendingAmount > 0 && (
              <div>
                <p>{this.t('wallet:pending')}</p>
                <p><span style={{fontWeight: '600'}}>
                  {
                    new Intl.NumberFormat(this.gui.language, {
                      maximumFractionDigits: 6
                    }).format(this.wallet.pendingAmount)
                  }
                </span> XVC</p>
              </div>
            )
          }
          {
            newmint > 0 && (
              <div style={{margin: '0 10px 0 10px'}}>
                <p>{this.t('wallet:immature')}</p>
                <p><span style={{fontWeight: '600'}}>
                  {
                    new Intl.NumberFormat(this.gui.language, {
                      maximumFractionDigits: 6
                    }).format(newmint)
                  }
                </span> XVC</p>
              </div>
            )
          }
          {
            stake > 0 && (
              <div>
                <p>{this.t('wallet:staking')}</p>
                <p><span style={{fontWeight: '600'}}>
                  {
                    new Intl.NumberFormat(this.gui.language, {
                      maximumFractionDigits: 6
                    }).format(stake)
                  }
                </span> XVC</p>
              </div>
            )
          }
        </div>
        <div className='flex' style={{justifyContent: 'flex-end'}}>
          <Menu
            defaultSelectedKeys={['/']}
            mode='horizontal'
            onClick={(item) => {
              this.props.history.push('/' + this.connections.viewing + item.key)
            }}
            style={{margin: '0 10px 0 0'}}
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
          {
            this.info.isEncrypted === true && (
              <div style={{margin: '0 10px 0 0'}}>
                <WalletLock />
                <WalletUnlock />
              </div>
            )
          }
        </div>
      </header>
    )
  }
}

export default withRouter(Header)
