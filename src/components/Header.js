import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Menu, Tooltip } from 'antd'

/** Required components. */
import WalletLock from './WalletLock'
import WalletUnlock from './WalletUnlock'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('network', 'rates', 'transactions', 'ui', 'wallet') @observer

export default class Header extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.network = props.network
    this.rates = props.rates
    this.transactions = props.transactions
    this.ui = props.ui
    this.wallet = props.wallet
    this.setRoute = this.setRoute.bind(this)
  }

  setRoute (e) {
    this.ui.setRoute(e.key)
  }

  render () {
    const { local, localCurrency, average } = this.rates
    const { balance, newmint, stake } = this.wallet.info
    const { votecandidate, collateralbalance } = this.network.incentiveInfo
    const { Item } = Menu

    return (
      <header className='shadow'>
        <img src='./assets/images/logoRed.png' />
        <p>
          {this.t('wallet:balance')}
          <br />
          <span>
            {
              new Intl.NumberFormat(this.ui.language, {
                minimumFractionDigits: 6,
                maximumFractionDigits: 6
              }).format(balance)
            }
          </span> XVC
        </p>
        <p className='balance'>
          ~<span>
            {
              new Intl.NumberFormat(this.ui.language, {
                minimumFractionDigits: 8,
                maximumFractionDigits: 8
              }).format(balance * average)
            }
          </span> BTC
        </p>
        <p className='balance'>
          ~<span>
            {
              new Intl.NumberFormat(this.ui.language, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }).format(balance * average * local)
            }
          </span> {localCurrency}
        </p>
        <div className='incoming'>
          {
            this.transactions.pendingAmount > 0 && (
              <p>
                {this.t('wallet:pending')}
                <br />
                <span>
                  {
                    new Intl.NumberFormat(this.ui.language, {
                      minimumFractionDigits: 6,
                      maximumFractionDigits: 6
                    }).format(this.transactions.pendingAmount)
                  }
                </span> XVC
              </p>
            )
          }
          {
            newmint > 0 && (
              <p>
                {this.t('wallet:immature')}
                <br />
                <span>
                  {
                    new Intl.NumberFormat(this.ui.language, {
                      minimumFractionDigits: 6,
                      maximumFractionDigits: 6
                    }).format(newmint)
                  }
                </span> XVC
              </p>
            )
          }
          {
            stake > 0 && (
              <p>
                {this.t('wallet:staking')}
                <br />
                <span>
                  {
                    new Intl.NumberFormat(this.ui.language, {
                      minimumFractionDigits: 6,
                      maximumFractionDigits: 6
                    }).format(stake)
                  }
                </span> XVC
              </p>
            )
          }
        </div>
        <div className='controls'>
          <WalletLock />
          <WalletUnlock />
        </div>
        <nav>
          <Menu
            onClick={this.setRoute}
            selectedKeys={[this.ui.activeRoute]}
            mode='horizontal'
          >
            <Item key='/'>
              <i className='material-icons md-20'>account_balance_wallet</i>
            </Item>
            <Item key='addresses'>
              <i className='material-icons md-20'>send</i>
            </Item>
            <Item key='maintenance'>
              <i className='material-icons md-20'>settings</i>
            </Item>
          </Menu>
        </nav>
        <div className='indicators'>
          {
            votecandidate === true && (
              <Tooltip
                placement='bottom'
                title={
                  <p>
                    {this.t('wallet:validCollateral') + ' '}
                    <span className='text-dotted'>
                      {
                        new Intl.NumberFormat(this.ui.language, {
                          minimumFractionDigits: 6,
                          maximumFractionDigits: 6
                        }).format(collateralbalance)
                      }
                    </span> XVC.
                  </p>
                }
              >
                <i
                  className='material-icons md-20'
                  style={{color: '#43464B'}}
                >
                  verified_user
                </i>
              </Tooltip>
            )
          }
          {
            /**
             * TODO: Staking indicator if config pos:1 & unlocked
             * (gavel, loyalty, flag, flash on, rowing).
             */
          }
        </div>
      </header>
    )
  }
}
