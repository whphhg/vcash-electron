import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Col, Row } from 'antd'

/** Required components. */
import NetworkEndpointsTable from './NetworkEndpointsTable'
import NetworkPeersTable from './NetworkPeersTable'
import RewardCalculator from './RewardCalculator'
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
@inject('wallet') @observer

class Maintenance extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.wallet = props.wallet
  }

  render () {
    return (
      <div>
        <Row>
          <Col span={24} className='shadow'>
            <div className='toolbar'>
              <div className='left'>
                <RewardCalculator />
              </div>
              <div className='right'>
                <p>{this.t('wallet:selectLanguage')}</p>
                <SelectLanguage />
                <p>{this.t('wallet:selectCurrency')}</p>
                <SelectCurrency />
              </div>
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
        <Row id='maintenance-tables'>
          <Col span={19}>
            <NetworkPeersTable />
          </Col>
          <Col span={5}>
            <div style={{margin: '0 0 0 6px'}}>
              <NetworkEndpointsTable />
            </div>
          </Col>
        </Row>
      </div>
    )
  }
}

export default Maintenance
