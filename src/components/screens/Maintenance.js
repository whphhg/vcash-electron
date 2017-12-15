import React from 'react'
import { translate } from 'react-i18next'
import { Route } from 'react-router-dom'
import { inject, observer } from 'mobx-react'

/** Components */
import Console from '../utilities/Console'
import Header from '../Header'
import Footer from '../Footer'
import MaintenanceMenu from '../menus/MaintenanceMenu'
import PrivateKeyDump from '../wallet/PrivateKeyDump'
import PrivateKeyImport from '../wallet/PrivateKeyImport'
import SetLocaleSettings from '../settings/SetLocaleSettings'
import SetSoundAlerts from '../settings/SetSoundAlerts'
import WalletBackup from '../wallet/WalletBackup'
import WalletDump from '../wallet/WalletDump'
import WalletEncrypt from '../wallet/WalletEncrypt'
import WalletPassphraseChange from '../wallet/WalletPassphraseChange'
import WalletRepair from '../wallet/WalletRepair'
import WalletSeedDump from '../wallet/WalletSeedDump'

@translate(['wallet'])
@inject('connections')
@observer
class Maintenance extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.connections = props.connections
  }

  render() {
    return (
      <div id="AppListContent">
        <div className="list grid-tb">
          <div>
            <MaintenanceMenu />
          </div>
          <div>
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
            path={'/' + this.connections.viewingId + '/maintenance/general'}
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
            path={'/' + this.connections.viewingId + '/maintenance/dump'}
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
            path={'/' + this.connections.viewingId + '/maintenance/import'}
            render={() => (
              <div>
                <PrivateKeyImport />
              </div>
            )}
          />
          <Route
            path={'/' + this.connections.viewingId + '/maintenance/console'}
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

export default Maintenance
