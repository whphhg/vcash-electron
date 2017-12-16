import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { humanReadable } from '../../utilities/common'

@translate(['wallet'])
@inject('gui', 'wallet')
@observer
class NetworkInfo extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.wallet = props.wallet
  }

  render() {
    return (
      <div className="flex" id="NetworkInfo">
        <div style={{ margin: '0 50px 0 0' }}>
          <div className="network-info">
            <div className="flex">
              <i className="material-icons md-16">hearing</i>
              <p>{this.t('listeningOn')}</p>
            </div>
            <div className="flex">
              <i className="material-icons md-16">settings_ethernet</i>
              <p>{this.t('portOpen')}</p>
            </div>
            <div className="flex">
              <i className="material-icons md-16">games</i>
              <p>{this.t('testnet')}</p>
            </div>
          </div>
          <div className="network-info">
            <div className="flex">
              <i className="material-icons md-16">account_balance</i>
              <p>{this.t('moneySupply')}</p>
            </div>
            <div className="flex">
              <i className="material-icons md-16">card_giftcard</i>
              <p>{this.t('txFee')}</p>
            </div>
            <div className="flex">
              <i className="material-icons md-16">card_giftcard</i>
              <p>{this.t('relayFee')}</p>
            </div>
          </div>
          <div className="network-info">
            <div className="flex">
              <i className="material-icons md-16">grid_on</i>
              <p>{this.t('currentBlockSize')}</p>
            </div>
            <div className="flex">
              <i className="material-icons md-16">playlist_add_check</i>
              <p>{this.t('currentBlockTxs')}</p>
            </div>
            <div className="flex">
              <i className="material-icons md-16">playlist_add</i>
              <p>{this.t('pooledTxs')}</p>
            </div>
          </div>
          <div className="network-info">
            <div className="flex">
              <i className="material-icons md-16">network_check</i>
              <p>{this.t('hashRate')}</p>
            </div>
            <div className="flex">
              <i className="material-icons md-16">trending_up</i>
              <p>{this.t('powDifficulty')}</p>
            </div>
            <div className="flex">
              <i className="material-icons md-16">trending_up</i>
              <p>{this.t('posDifficulty')}</p>
            </div>
          </div>
        </div>
        <div>
          <div className="network-info">
            <p>
              {this.wallet.info.ip}:{this.wallet.info.port}
            </p>
            <p>
              {this.t(this.wallet.info.networkstatus === 'ok' ? 'yes' : 'no')}
            </p>
            <p>{this.t(this.wallet.info.testnet === true ? 'yes' : 'no')}</p>
          </div>
          <div className="network-info">
            <p>
              {new Intl.NumberFormat(this.gui.language, {
                maximumFractionDigits: 0
              }).format(this.wallet.info.moneysupply)}{' '}
              XVC
            </p>
            <p>{this.wallet.info.paytxfee} XVC / kB</p>
            <p>{this.wallet.info.relayfee} XVC / kB</p>
          </div>
          <div className="network-info">
            <p>
              {humanReadable(
                this.wallet.info.currentblocksize,
                false,
                'B',
                this.gui.language
              )}
            </p>
            <p>{this.wallet.info.currentblocktx}</p>
            <p>{this.wallet.info.pooledtx}</p>
          </div>
          <div className="network-info">
            <p>
              {humanReadable(
                this.wallet.info.networkhashps,
                true,
                'H/s',
                this.gui.language
              )}
            </p>
            <p>
              {new Intl.NumberFormat(this.gui.language, {
                maximumFractionDigits: 2
              }).format(this.wallet.info['proof-of-work'])}
            </p>
            <p>
              {new Intl.NumberFormat(this.gui.language, {
                maximumFractionDigits: 2
              }).format(this.wallet.info['proof-of-stake'])}
            </p>
          </div>
        </div>
      </div>
    )
  }
}

export default NetworkInfo
