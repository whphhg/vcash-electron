import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { humanReadable } from '../utilities/common'

/** Required components. */
import RewardCalculator from './RewardCalculator'
import Difficulties from './charts/Difficulties'
import HashRate from './charts/HashRate'
import RewardSpread from './charts/RewardSpread'
import RewardsPerDay from './charts/RewardsPerDay'

@translate(['wallet'], { wait: true })
@inject('gui', 'walletNext')
@observer
class Network extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.wallet = props.walletNext
  }

  render() {
    return (
      <div id="NetworkGrid">
        <div className="shadow">
          <div style={{ margin: '0 10px 0 10px' }}>
            <div className="flex-sb" style={{ minHeight: '30px' }}>
              <div className="flex">
                <i className="material-icons md-16">redeem</i>
                <p style={{ margin: '0 10px 0 5px' }}>
                  {this.t('wallet:collateralBalance')}
                  <span style={{ fontWeight: 600 }}>
                    {' '}
                    {new Intl.NumberFormat(this.gui.language, {
                      maximumFractionDigits: 6
                    }).format(this.wallet.info.collateralbalance)}{' '}
                    /{' '}
                    {new Intl.NumberFormat(this.gui.language).format(
                      this.wallet.info.collateralrequired
                    )}
                  </span>{' '}
                  XVC
                </p>
                <i className="material-icons md-16">gavel</i>
                <p>
                  {this.t('wallet:voteCandidate')}
                  <span style={{ fontWeight: 600 }}>
                    {' '}
                    {this.wallet.info.votecandidate === true
                      ? this.t('wallet:yes')
                      : this.t('wallet:no')}
                  </span>
                </p>
              </div>
              <div className="flex">
                <i className="material-icons md-16">account_circle</i>
                <p>
                  {this.t('wallet:defaultAddress')}
                  <span style={{ fontWeight: 600 }}>
                    {' '}
                    {this.wallet.info.walletaddress === ''
                      ? this.t('wallet:unlockRevealed')
                      : this.wallet.info.walletaddress}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="shadow">
          <div style={{ margin: '10px 10px 0 10px' }}>
            <div id="NetworkColumnsGrid">
              <div style={{ minWidth: '100%' }}>
                <div className="flex">
                  <i className="material-icons md-16">timeline</i>
                  <p>{this.t('wallet:rewardSpread')}</p>
                </div>
                <RewardSpread />
                <div className="flex">
                  <i className="material-icons md-16">view_week</i>
                  <p>{this.t('wallet:rewardsPerDay')}</p>
                </div>
                <RewardsPerDay />
              </div>
              <div style={{ minWidth: '100%' }}>
                <div className="flex">
                  <i className="material-icons md-16">trending_up</i>
                  <p>{this.t('wallet:difficulties')}</p>
                </div>
                <Difficulties />
                <div className="flex">
                  <i className="material-icons md-16">network_check</i>
                  <p>{this.t('wallet:hashRate')}</p>
                </div>
                <HashRate />
              </div>
            </div>
          </div>
        </div>
        <div>
          <div style={{ margin: '10px 10px 0 10px' }}>
            <div className="flex-sb">
              <RewardCalculator />
              <div className="flex">
                <div className="flex">
                  <div style={{ margin: '0 36px 0 0' }}>
                    <div className="flex">
                      <i className="material-icons md-16">hearing</i>
                      <p>{this.t('wallet:listeningOn')}</p>
                    </div>
                    <div className="flex">
                      <i className="material-icons md-16">settings_ethernet</i>
                      <p>{this.t('wallet:portOpen')}</p>
                    </div>
                    <div className="flex">
                      <i className="material-icons md-16">event_seat</i>
                      <p>{this.t('wallet:collateralizedNodes')}</p>
                    </div>
                    <div className="flex">
                      <i className="material-icons md-16">games</i>
                      <p>{this.t('wallet:testnet')}</p>
                    </div>
                  </div>
                  <div style={{ margin: '0 0 1px 0' }}>
                    <p style={{ fontWeight: '500' }}>
                      {this.wallet.info.ip}:{this.wallet.info.port}
                    </p>
                    <p style={{ fontWeight: '500' }}>
                      {this.wallet.info.networkstatus === 'ok'
                        ? this.t('wallet:yes')
                        : this.t('wallet:no')}
                    </p>
                    <p style={{ fontWeight: '500' }}>
                      {this.wallet.info.collateralized} /{' '}
                      {this.wallet.info.endpoints.length}
                    </p>
                    <p style={{ fontWeight: '500' }}>
                      {this.wallet.info.testnet === true
                        ? this.t('wallet:yes')
                        : this.t('wallet:no')}
                    </p>
                  </div>
                </div>
                <div className="flex">
                  <div style={{ margin: '0 36px 0 36px' }}>
                    <div className="flex">
                      <i className="material-icons md-16">account_balance</i>
                      <p>{this.t('wallet:moneySupply')}</p>
                    </div>
                    <div className="flex">
                      <i className="material-icons md-16">grid_on</i>
                      <p>{this.t('wallet:currentBlockSize')}</p>
                    </div>
                    <div className="flex">
                      <i className="material-icons md-16">playlist_add_check</i>
                      <p>{this.t('wallet:currentBlockTxs')}</p>
                    </div>
                    <div className="flex">
                      <i className="material-icons md-16">playlist_add</i>
                      <p>{this.t('wallet:pooledTxs')}</p>
                    </div>
                  </div>
                  <div style={{ margin: '0 0 1px 0' }}>
                    <p>
                      <span style={{ fontWeight: '500' }}>
                        {new Intl.NumberFormat(this.gui.language, {
                          maximumFractionDigits: 0
                        }).format(this.wallet.info.moneysupply)}
                      </span>{' '}
                      XVC
                    </p>
                    <p style={{ fontWeight: '500' }}>
                      {humanReadable(this.wallet.info.currentblocksize, false)}
                    </p>
                    <p style={{ fontWeight: '500' }}>
                      {this.wallet.info.currentblocktx}
                    </p>
                    <p style={{ fontWeight: '500' }}>
                      {this.wallet.info.pooledtx}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Network
