import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Col, Row, Table } from 'antd'
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
@inject('network', 'wallet') @observer

export default class Maintenance extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.network = props.network
    this.wallet = props.wallet
  }

  render () {
    return (
      <div>
        <Row>
          <Col span={24} className='shadow'>
            <div className='toolbar'>
              <i className='material-icons md-20 left'>language</i>
              <div className='left'>
                <p>{this.t('wallet:selectLanguage')}</p>
                <SelectLanguage />
              </div>
              <div className='right'>
                <p>{this.t('wallet:selectCurrency')}</p>
                <SelectCurrency />
              </div>
              <i className='material-icons md-20 right'>monetization_on</i>
            </div>
          </Col>
        </Row>
        <Row id='maintenance' className='shadow'>
          <Col span={12}>
            <div style={{margin: '10px 10px 0 10px'}}>
              <WalletBackup />
              <hr />
              <WalletDump />
              <hr />
              <WalletSeedDump />
            </div>
          </Col>
          <Col span={12}>
            <div style={{margin: '10px 10px 0 10px'}}>
              <WalletEncrypt />
              <WalletPassphraseChange />
              { /** TODO: Implement wallet check and repair. */ }
            </div>
          </Col>
        </Row>
        <Row style={{margin: '0 10px 10px 10px'}}>
          <Col span={17}>
            <Table
              bordered
              size='small'
              scroll={
                this.network.peers.length > 8
                  ? {y: 200}
                  : {}
              }
              pagination={false}
              dataSource={this.network.peers}
              columns={[
                {
                  title: this.t('wallet:peers'),
                  dataIndex: 'addr',
                  width: 180
                },
                {
                  title: this.t('wallet:version'),
                  dataIndex: 'version',
                  width: 100
                },
                {
                  title: this.t('wallet:os'),
                  dataIndex: 'os',
                  width: 120
                },
                {
                  title: this.t('wallet:connected'),
                  dataIndex: 'conntime',
                  width: 130,
                  render: text => moment(text * 1000).fromNow()
                },
                {
                  title: this.t('wallet:startingHeight'),
                  dataIndex: 'startingheight',
                  width: 130
                },
                {
                  title: this.t('wallet:banScore'),
                  dataIndex: 'banscore',
                  render: text => text + '/100'
                }
              ]}
            />
          </Col>
        </Row>
      </div>
    )
  }
}
