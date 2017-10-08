import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import moment from 'moment'

/** Ant Design */
import Table from 'antd/lib/table'

/** Required components. */
import SelectCurrency from './SelectCurrency'
import SelectLanguage from './SelectLanguage'
import SelectSoundAlerts from './SelectSoundAlerts'
import WalletBackup from './WalletBackup'
import WalletDump from './WalletDump'
import WalletEncrypt from './WalletEncrypt'
import WalletPassphraseChange from './WalletPassphraseChange'
import WalletRepair from './WalletRepair'
import WalletSeedDump from './WalletSeedDump'

@translate(['wallet'], { wait: true })
@inject('gui', 'wallet')
@observer
class Maintenance extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.wallet = props.wallet
  }

  render() {
    return (
      <div id="MaintenanceGrid">
        <div className="shadow">
          <div style={{ margin: '0 10px 0 10px' }}>
            <div className="flex-sb" style={{ minHeight: '30px' }}>
              <div className="flex">
                <i className="material-icons md-16">language</i>
                <p style={{ margin: '0 10px 0 5px' }}>
                  {this.t('wallet:selectLanguage')}
                </p>
                <SelectLanguage />
              </div>
              <div className="flex">
                <i className="material-icons md-16">monetization_on</i>
                <p style={{ margin: '0 10px 0 5px' }}>
                  {this.t('wallet:selectCurrency')}
                </p>
                <SelectCurrency />
              </div>
            </div>
          </div>
        </div>
        <div className="shadow">
          <div style={{ display: 'flex', margin: '10px' }}>
            <div style={{ flex: 1, margin: '0 10px 0 0' }}>
              <WalletBackup />
              <hr />
              <WalletDump />
              <hr />
              <WalletSeedDump />
            </div>
            <div style={{ flex: 1, margin: '0 0 0 10px' }}>
              <WalletEncrypt />
              <WalletPassphraseChange />
              <hr />
              <WalletRepair />
              <hr />
              <SelectSoundAlerts />
            </div>
          </div>
        </div>
        <Table
          bordered
          columns={[
            {
              dataIndex: 'ip',
              title: this.t('wallet:peers'),
              width: 120
            },
            {
              dataIndex: 'port',
              title: this.t('wallet:port'),
              width: 90
            },
            {
              dataIndex: 'version',
              title: this.t('wallet:version'),
              width: 90
            },
            {
              dataIndex: 'os',
              title: this.t('wallet:os'),
              width: 110
            },
            {
              dataIndex: 'inbound',
              title: this.t('wallet:inbound'),
              width: 110,
              render: (text, record) =>
                record.inbound === true
                  ? this.t('wallet:yes')
                  : this.t('wallet:no')
            },
            {
              dataIndex: 'conntime',
              title: this.t('wallet:connected'),
              width: 170,
              render: text => moment(text * 1000).fromNow()
            },
            {
              dataIndex: 'lastrecv',
              title: this.t('wallet:lastReceived'),
              width: 170,
              render: text => moment(text * 1000).fromNow()
            },
            {
              dataIndex: 'startingheight',
              title: this.t('wallet:startingHeight'),
              width: 130,
              render: text =>
                new Intl.NumberFormat(this.gui.language).format(text)
            },
            {
              dataIndex: 'banscore',
              title: this.t('wallet:banScore'),
              render: text => text + '/100'
            }
          ]}
          dataSource={this.wallet.peers}
          locale={{ emptyText: this.t('wallet:notFound') }}
          pagination={false}
          scroll={this.wallet.peers.length > 8 ? { y: 183 } : {}}
          size="small"
          style={{ margin: '10px 10px 0 10px' }}
        />
      </div>
    )
  }
}

export default Maintenance
