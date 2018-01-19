import React from 'react'
import { translate } from 'react-i18next'
import { Route } from 'react-router-dom'
import { inject, observer } from 'mobx-react'

/** Components */
import Console from '../utilities/Console.js'
import Header from '../Header.js'
import Footer from '../Footer.js'
import MaintenanceMenu from '../menus/MaintenanceMenu.js'
import PrivateKeyDump from '../wallet/PrivateKeyDump.js'
import PrivateKeyImport from '../wallet/PrivateKeyImport.js'
import SetLocaleSettings from '../settings/SetLocaleSettings.js'
import SetSoundAlerts from '../settings/SetSoundAlerts.js'
import WalletBackup from '../wallet/WalletBackup.js'
import WalletDump from '../wallet/WalletDump.js'
import WalletEncrypt from '../wallet/WalletEncrypt.js'
import WalletPassphraseChange from '../wallet/WalletPassphraseChange.js'
import WalletRepair from '../wallet/WalletRepair.js'
import WalletSeedDump from '../wallet/WalletSeedDump.js'

@translate(['common'])
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
