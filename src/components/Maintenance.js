import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Table } from 'antd'
import moment from 'moment'

/** Required components. */
import SelectCurrency from './SelectCurrency'
import SelectLanguage from './SelectLanguage'
import WalletBackup from './WalletBackup'
import WalletDump from './WalletDump'
import WalletEncrypt from './WalletEncrypt'
import WalletPassphraseChange from './WalletPassphraseChange'
import WalletSeedDump from './WalletSeedDump'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('gui', 'wallet') @observer

export default class Maintenance extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.wallet = props.wallet
  }

  render () {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateRows: '35px 1fr 230px',
          height: '100%'
        }}
      >
        <div className='shadow'>
          <div style={{margin: '0 10px 0 10px'}}>
            <div className='flex-sb' style={{minHeight: '35px'}}>
              <div className='flex'>
                <i className='material-icons md-16'>language</i>
                <p style={{margin: '0 10px 0 5px'}}>
                  {this.t('wallet:selectLanguage')}
                </p>
                <SelectLanguage />
              </div>
              <div className='flex'>
                <i className='material-icons md-16'>monetization_on</i>
                <p style={{margin: '0 10px 0 5px'}}>
                  {this.t('wallet:selectCurrency')}
                </p>
                <SelectCurrency />
              </div>
            </div>
          </div>
        </div>
        <div className='shadow'>
          <div style={{display: 'flex', margin: '10px'}}>
            <div style={{flex: 1, margin: '0 10px 0 0'}}>
              <WalletBackup />
              <hr />
              <WalletDump />
              <hr />
              <WalletSeedDump />
            </div>
            <div style={{flex: 1, margin: '0 0 0 10px'}}>
              <WalletEncrypt />
              <WalletPassphraseChange />
              {/** TODO: Implement wallet check and repair. */}
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
              width: 80
            },
            {
              dataIndex: 'version',
              title: this.t('wallet:version'),
              width: 80
            },
            {
              dataIndex: 'os',
              title: this.t('wallet:os'),
              width: 120
            },
            {
              dataIndex: 'inbound',
              title: this.t('wallet:inbound'),
              width: 100,
              render: (text, record) =>
                record.inbound === true
                  ? this.t('wallet:yes')
                  : this.t('wallet:no')
            },
            {
              dataIndex: 'conntime',
              title: this.t('wallet:connected'),
              width: 140,
              render: text => moment(text * 1000).fromNow()
            },
            {
              dataIndex: 'lastsend',
              title: this.t('wallet:lastSend'),
              width: 140,
              render: text => moment(text * 1000).fromNow()
            },
            {
              dataIndex: 'lastrecv',
              title: this.t('wallet:lastReceived'),
              width: 140,
              render: text => moment(text * 1000).fromNow()
            },
            {
              dataIndex: 'startingheight',
              title: this.t('wallet:startingHeight'),
              width: 110,
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
          pagination={false}
          scroll={this.wallet.peers.length > 8 ? {y: 183} : {}}
          size='small'
          style={{margin: '10px 10px 0 10px'}}
        />
      </div>
    )
  }
}
