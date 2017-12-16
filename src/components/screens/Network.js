import React from 'react'
import { translate } from 'react-i18next'
import { Route } from 'react-router-dom'
import { inject, observer } from 'mobx-react'

/** Ant Design */
import Tooltip from 'antd/lib/tooltip'

/** Components */
import DailyRewardChart from '../charts/DailyRewardChart'
import DifficultyChart from '../charts/DifficultyChart'
import Footer from '../Footer'
import HashRateChart from '../charts/HashRateChart'
import Header from '../Header'
import NetworkInfo from '../wallet/NetworkInfo'
import NetworkMenu from '../menus/NetworkMenu'
import Peers from '../wallet/Peers'
import RecentBlockList from '../lists/RecentBlockList'
import RewardSpreadChart from '../charts/RewardSpreadChart'

@translate(['wallet'])
@inject('connections', 'gui', 'wallet')
@observer
class Network extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.connections = props.connections
    this.gui = props.gui
    this.wallet = props.wallet
  }

  render() {
    const key = '/' + this.connections.viewingId + '/network/'
    return (
      <div id="AppListContent">
        <div className="list grid-tb">
          <div>
            <NetworkMenu />
          </div>
          <div>
            <Tooltip placement="bottom" title={this.t('addrDefault')}>
              <i className="flex-center material-icons md-16">account_circle</i>
            </Tooltip>
            <p
              className="flex-center"
              style={{ fontWeight: 500, margin: '10px 0 0 0' }}
            >
              {this.wallet.info.walletaddress === ''
                ? this.t('unlockReveal')
                : this.wallet.info.walletaddress}
            </p>
            <hr />
            <div className="flex-sb" style={{ padding: '0px 10px 5px 10px' }}>
              <div className="flex">
                <i className="material-icons md-16">gavel</i>
                <p>{this.t('voteCandidate')}</p>
              </div>
              <p
                className={
                  this.wallet.info.votecandidate === true ? 'green' : 'red'
                }
                style={{ fontWeight: 500 }}
              >
                {this.t(this.wallet.info.votecandidate === true ? 'yes' : 'no')}
              </p>
            </div>
            <div className="flex-sb" style={{ padding: '0 10px 5px 10px' }}>
              <div className="flex">
                <i className="material-icons md-16">event_seat</i>
                <p>{this.t('collateralizedNodes')}</p>
              </div>
              <p style={{ fontWeight: '500' }}>
                {this.wallet.info.collateralized} /{' '}
                {this.wallet.info.endpoints.length}
              </p>
            </div>
            <div className="flex-sb" style={{ padding: '0 10px 10px 10px' }}>
              <div className="flex">
                <i className="material-icons md-16">redeem</i>
                <p style={{ margin: '0 10px 0 5px' }}>
                  {this.t('collateralBalance')}
                </p>
              </div>
              <p>
                <span
                  className={
                    this.wallet.info.collateralbalance >=
                    this.wallet.info.collateralrequired
                      ? 'green'
                      : 'red'
                  }
                  style={{ fontWeight: 500 }}
                >
                  {new Intl.NumberFormat(this.gui.language, {
                    maximumFractionDigits: 6
                  }).format(this.wallet.info.collateralbalance)}
                </span>{' '}
                /{' '}
                <span style={{ fontWeight: 500 }}>
                  {new Intl.NumberFormat(this.gui.language).format(
                    this.wallet.info.collateralrequired
                  )}
                </span>{' '}
                XVC
              </p>
            </div>
          </div>
        </div>
        <div id="AppHeaderFooter">
          <Header />
          <Route
            path={key + 'info'}
            render={() => (
              <div className="grid-tb">
                <div id="InfoBlocks">
                  <NetworkInfo />
                  <RecentBlockList />
                </div>
                <Peers />
              </div>
            )}
          />
          <Route
            path={key + 'rewards'}
            render={() => (
              <div className="grid-tb">
                <div style={{ minWidth: '100%' }}>
                  <div className="flex" style={{ margin: '0 0 10px 0' }}>
                    <i className="material-icons md-16">timeline</i>
                    <p>{this.t('rewardSpread')}</p>
                  </div>
                  <RewardSpreadChart />
                </div>
                <div style={{ minWidth: '100%' }}>
                  <div className="flex" style={{ margin: '0 0 10px 0' }}>
                    <i className="material-icons md-16">view_week</i>
                    <p>{this.t('rewardsPerDay')}</p>
                  </div>
                  <DailyRewardChart />
                </div>
              </div>
            )}
          />
          <Route
            path={key + 'rates'}
            render={() => (
              <div className="grid-tb">
                <div style={{ minWidth: '100%' }}>
                  <div className="flex" style={{ margin: '0 0 10px 0' }}>
                    <i className="material-icons md-16">trending_up</i>
                    <p>{this.t('difficulties')}</p>
                  </div>
                  <DifficultyChart />
                </div>
                <div style={{ minWidth: '100%' }}>
                  <div className="flex" style={{ margin: '0 0 10px 0' }}>
                    <i className="material-icons md-16">network_check</i>
                    <p>{this.t('hashRate')}</p>
                  </div>
                  <HashRateChart />
                </div>
              </div>
            )}
          />
          <Footer />
        </div>
      </div>
    )
  }
}

export default Network
