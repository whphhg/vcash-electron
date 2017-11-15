import React from 'react'
import { translate } from 'react-i18next'
import { Route, withRouter } from 'react-router-dom'
import { action, extendObservable } from 'mobx'
import { inject, observer } from 'mobx-react'

/** Ant Design */
import Menu from 'antd/lib/menu'

/** Components */
import Console from './Console'
import Header from './Header'
import Footer from './Footer'
import PrivateKeyDump from './PrivateKeyDump'
import PrivateKeyImport from './PrivateKeyImport'
import SetLocaleSettings from './SetLocaleSettings'
import SetSoundAlerts from './SetSoundAlerts'
import WalletBackup from './WalletBackup'
import WalletDump from './WalletDump'
import WalletEncrypt from './WalletEncrypt'
import WalletPassphraseChange from './WalletPassphraseChange'
import WalletRepair from './WalletRepair'
import WalletSeedDump from './WalletSeedDump'

@translate(['wallet'])
@inject('connections', 'gui', 'wallet')
@observer
class Maintenance extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.connections = props.connections
    this.gui = props.gui
    this.wallet = props.wallet

    /** Extend the component with observable properties. */
    extendObservable(this, {
      selected: '/' + this.connections.viewingId + '/maintenance/general'
    })
  }

  /**
   * Set selected menu item and navigate to it.
   * @function setSelected
   * @param {object} item - Routing path and menu item key.
   */
  @action
  setSelected = ({ key }) => {
    this.selected = key

    if (this.props.history.location.pathname !== key) {
      this.props.history.push(key)
    }
  }

  render() {
    const key = '/' + this.connections.viewingId + '/maintenance/'

    return (
      <div id="AppListContent">
        <div className="list grid-tb">
          <div style={{ width: '100%' }}>
            <Menu
              mode="inline"
              onClick={this.setSelected}
              selectedKeys={[this.selected]}
            >
              <Menu.Item key={key + 'general'}>
                <div className="flex">
                  <i className="material-icons md-20">tune</i>
                  <p style={{ margin: '0 0 0 10px' }}>
                    {this.t('maintenance')}
                  </p>
                </div>
              </Menu.Item>
              <Menu.Item key={key + 'dump'}>
                <div className="flex">
                  <i className="material-icons md-20">arrow_upward</i>
                  <p style={{ margin: '0 0 0 10px' }}>
                    {this.t('maintenanceDump')}
                  </p>
                </div>
              </Menu.Item>
              <Menu.Item key={key + 'import'}>
                <div className="flex">
                  <i className="material-icons md-20">arrow_downward</i>
                  <p style={{ margin: '0 0 0 10px' }}>
                    {this.t('maintenanceImport')}
                  </p>
                </div>
              </Menu.Item>
              <Menu.Item key={key + 'console'}>
                <div className="flex">
                  <i className="material-icons md-20">remove_from_queue</i>
                  <p style={{ margin: '0 0 0 10px' }}>{this.t('rpcConsole')}</p>
                </div>
              </Menu.Item>
            </Menu>
          </div>
          <div style={{ width: '100%' }}>
            <div style={{ padding: '0 10px' }}>
              <SetSoundAlerts />
            </div>
            <hr />
            <div style={{ padding: '0 10px 10px 10px' }}>
              <SetLocaleSettings />
            </div>
          </div>
        </div>
        <div id="AppHeaderFooter">
          <Header />
          <Route
            path={key + 'general'}
            render={() => (
              <div>
                <WalletEncrypt />
                <WalletPassphraseChange />
                <hr />
                <WalletBackup />
                <hr />
                <WalletRepair />
              </div>
            )}
          />
          <Route
            path={key + 'dump'}
            render={() => (
              <div>
                <PrivateKeyDump />
                <hr />
                <WalletDump />
                <hr />
                <WalletSeedDump />
              </div>
            )}
          />
          <Route
            path={key + 'import'}
            render={() => (
              <div>
                <PrivateKeyImport />
              </div>
            )}
          />
          <Route
            path={key + 'console'}
            render={() => (
              <div style={{ padding: '10px 10px 0 11px' }}>
                <Console />
              </div>
            )}
          />
          <Footer />
        </div>
      </div>
    )
  }
}

export default withRouter(Maintenance)
