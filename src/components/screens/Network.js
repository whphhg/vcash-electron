import React from 'react'
import { translate } from 'react-i18next'
import { Route } from 'react-router-dom'
import { inject, observer } from 'mobx-react'

/** Components */
import DailyRewardChart from '../charts/DailyRewardChart.js'
import DifficultyChart from '../charts/DifficultyChart.js'
import Footer from '../Footer.js'
import HashRateChart from '../charts/HashRateChart.js'
import Header from '../Header.js'
import IncentiveInfo from '../wallet/IncentiveInfo.js'
import NetworkInfo from '../wallet/NetworkInfo.js'
import NetworkMenu from '../menus/NetworkMenu.js'
import Peers from '../wallet/Peers.js'
import RecentBlockList from '../lists/RecentBlockList.js'
import RewardSpreadChart from '../charts/RewardSpreadChart.js'

@translate(['common'])
@inject('connections')
@observer
class Network extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.connections = props.connections
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
            <IncentiveInfo />
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
