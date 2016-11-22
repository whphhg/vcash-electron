import React from 'react'
import { inject, observer } from 'mobx-react'
import { Button, Col, Input, Row } from 'antd'

/** Make the component reactive and inject MobX stores. */
@inject('wallet', 'walletSeedDump') @observer

class WalletSeedDump extends React.Component {
  constructor(props) {
    super(props)
    this.wallet = props.wallet
    this.walletSeedDump = props.walletSeedDump
    this.dumpwalletseed = this.dumpwalletseed.bind(this)
  }

  dumpwalletseed() {
    this.walletSeedDump.dumpwalletseed()
  }

  componentWillUnmount() {
    this.walletSeedDump.setSeed()
  }

  render() {
    return (
      <div>
        <p style={{margin: '0 0 5px 0'}}>
          <i className='material-icons md-18'>fingerprint</i>
          <span className='text-icon'>Dump the hierarchical deterministic wallet seed</span>
        </p>
        <Row>
          <Col span={3}>
            <p style={{margin: '4px 0 0 0'}}>The seed</p>
          </Col>
          <Col span={21}>
            <Input
              value={this.walletSeedDump.seed}
              disabled={this.walletSeedDump.seed === ''}
            />
          </Col>
        </Row>
        <Row>
          <Col offset={3} span={8}>
            {
              this.walletSeedDump.errorStatus === 'notDeterministic' && (
                <p className='text-error'>The wallet is not deterministic.</p>
              )
            }
          </Col>
          <Col span={13} className='text-right'>
            <Button
              style={{margin: '5px 0 0 0'}}
              onClick={this.dumpwalletseed}
              disabled={this.walletSeedDump.errorStatus !== false || this.wallet.isLocked === true}
            >
              Dump the seed
            </Button>
          </Col>
        </Row>
      </div>
    )
  }
}

export default WalletSeedDump
