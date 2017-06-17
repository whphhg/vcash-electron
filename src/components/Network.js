import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { humanReadable } from '../utilities/common'

/** Required components. */
import RewardCalculator from './RewardCalculator'
import { Difficulties, HashRate, RewardSpread, RewardsPerDay } from './charts'

@translate(['wallet'], { wait: true })
@inject('gui', 'wallet')
@observer
class Network extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.wallet = props.wallet
  }

  render () {
    const { ip, moneysupply, port } = this.wallet.info.getinfo
    const { collateralized, endpoints } = this.wallet.info.getnetworkinfo
    const {
      collateralbalance,
      collateralrequired,
      networkstatus,
      votecandidate,
      walletaddress
    } = this.wallet.info.getincentiveinfo

    const {
      currentblocksize,
      currentblocktx,
      pooledtx,
      testnet
    } = this.wallet.info.getmininginfo

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateRows: '35px 1fr 100px',
          height: '100%'
        }}
      >
        <div className='shadow'>
          <div style={{ margin: '0 10px 0 10px' }}>
            <div className='flex-sb' style={{ minHeight: '35px' }}>
              <div className='flex'>
                <i className='material-icons md-16'>redeem</i>
                <p style={{ margin: '0 10px 0 5px' }}>
                  {this.t('wallet:collateralBalance')}
                  <span style={{ fontWeight: 600 }}>
                    {' '}
                    {new Intl.NumberFormat(this.gui.language, {
                      maximumFractionDigits: 6
                    }).format(collateralbalance)}{' '}
                    /{' '}
                    {new Intl.NumberFormat(this.gui.language).format(
                      collateralrequired
                    )}
                  </span>{' '}
                  XVC
                </p>
                <i className='material-icons md-16'>gavel</i>
                <p>
                  {this.t('wallet:voteCandidate')}
                  <span style={{ fontWeight: 600 }}>
                    {' '}
                    {votecandidate === true
                      ? this.t('wallet:yes')
                      : this.t('wallet:no')}
                  </span>
                </p>
              </div>
              <div className='flex'>
                <i className='material-icons md-16'>account_circle</i>
                <p>
                  {this.t('wallet:defaultAddress')}
                  <span style={{ fontWeight: 600 }}>
                    {' '}
                    {walletaddress === ''
                      ? this.t('wallet:unlockRevealed')
                      : walletaddress}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className='shadow'>
          <div style={{ margin: '10px 10px 0 10px' }}>
            <div
              style={{
                display: 'grid',
                gridGap: '20px',
                gridTemplateColumns: '1fr 1fr',
                height: '100%'
              }}
            >
              <div style={{ minWidth: '100%' }}>
                <div className='flex'>
                  <i className='material-icons md-16'>timeline</i>
                  <p>{this.t('wallet:rewardSpread')}</p>
                </div>
                <RewardSpread />
                <div className='flex'>
                  <i className='material-icons md-16'>view_week</i>
                  <p>{this.t('wallet:rewardsPerDay')}</p>
                </div>
                <RewardsPerDay />
              </div>
              <div style={{ minWidth: '100%' }}>
                <div className='flex'>
                  <i className='material-icons md-16'>trending_up</i>
                  <p>{this.t('wallet:difficulties')}</p>
                </div>
                <Difficulties />
                <div className='flex'>
                  <i className='material-icons md-16'>network_check</i>
                  <p>{this.t('wallet:hashRate')}</p>
                </div>
                <HashRate />
              </div>
            </div>
          </div>
        </div>
        <div>
          <div style={{ margin: '10px 10px 0 10px' }}>
            <div className='flex-sb'>
              <RewardCalculator />
              <div className='flex'>
                <div className='flex'>
                  <div style={{ margin: '0 36px 0 0' }}>
                    <div className='flex'>
                      <i className='material-icons md-16'>hearing</i>
                      <p>{this.t('wallet:listeningOn')}</p>
                    </div>
                    <div className='flex'>
                      <i className='material-icons md-16'>settings_ethernet</i>
                      <p>{this.t('wallet:portOpen')}</p>
                    </div>
                    <div className='flex'>
                      <i className='material-icons md-16'>event_seat</i>
                      <p>{this.t('wallet:collateralizedNodes')}</p>
                    </div>
                    <div className='flex'>
                      <i className='material-icons md-16'>games</i>
                      <p>{this.t('wallet:testnet')}</p>
                    </div>
                  </div>
                  <div style={{ margin: '0 0 1px 0' }}>
                    <p style={{ fontWeight: '500' }}>
                      {ip}:{port}
                    </p>
                    <p style={{ fontWeight: '500' }}>
                      {networkstatus === 'ok'
                        ? this.t('wallet:yes')
                        : this.t('wallet:no')}
                    </p>
                    <p style={{ fontWeight: '500' }}>
                      {collateralized} / {endpoints.length}
                    </p>
                    <p style={{ fontWeight: '500' }}>
                      {testnet === true
                        ? this.t('wallet:yes')
                        : this.t('wallet:no')}
                    </p>
                  </div>
                </div>
                <div className='flex'>
                  <div style={{ margin: '0 36px 0 36px' }}>
                    <div className='flex'>
                      <i className='material-icons md-16'>account_balance</i>
                      <p>{this.t('wallet:moneySupply')}</p>
                    </div>
                    <div className='flex'>
                      <i className='material-icons md-16'>grid_on</i>
                      <p>{this.t('wallet:currentBlockSize')}</p>
                    </div>
                    <div className='flex'>
                      <i className='material-icons md-16'>playlist_add_check</i>
                      <p>{this.t('wallet:currentBlockTxs')}</p>
                    </div>
                    <div className='flex'>
                      <i className='material-icons md-16'>playlist_add</i>
                      <p>{this.t('wallet:pooledTxs')}</p>
                    </div>
                  </div>
                  <div style={{ margin: '0 0 1px 0' }}>
                    <p>
                      <span style={{ fontWeight: '500' }}>
                        {new Intl.NumberFormat(this.gui.language, {
                          maximumFractionDigits: 0
                        }).format(moneysupply)}
                      </span>{' '}
                      XVC
                    </p>
                    <p style={{ fontWeight: '500' }}>
                      {humanReadable(currentblocksize, false)}
                    </p>
                    <p style={{ fontWeight: '500' }}>
                      {currentblocktx}
                    </p>
                    <p style={{ fontWeight: '500' }}>
                      {pooledtx}
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
