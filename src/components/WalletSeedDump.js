import React from 'react'
import { observer } from 'mobx-react'
import { Button, Col, Popover, Row } from 'antd'

/** Make the component reactive and inject MobX stores. */
@observer(['wallet', 'walletSeedDump'])

class WalletSeedDump extends React.Component {
  constructor(props) {
    super(props)
    this.wallet = props.wallet
    this.walletSeedDump = props.walletSeedDump
    this.dumpwalletseed = this.dumpwalletseed.bind(this)
    this.togglePopover = this.togglePopover.bind(this)
  }

  dumpwalletseed() {
    this.walletSeedDump.dumpwalletseed()
  }

  togglePopover() {
    this.walletSeedDump.togglePopover()
  }

  popoverContent() {
    return (
      <div style={{width:'470px'}}>
        <Row>
          <Col span={24}>
            <p style={{textAlign:'justify'}}>
              Hierarchical deterministic wallet can be shared partially or entirely with different systems, each with or without the ability to spend coins.
            </p>
          </Col>
        </Row>
        <Row style={{marginTop:'10px'}}>
          <Col span={14}>
            {
              this.walletSeedDump.errorStatus === 'notDeterministic' && (
                <p className='error-text'>The wallet is not deterministic.</p>
              )
            }
          </Col>
          <Col span={10} className='text-right'>
            <Button onClick={this.dumpwalletseed} disabled={this.walletSeedDump.errorStatus !== false} style={{marginLeft:'10px'}}>Dump the seed</Button>
          </Col>
        </Row>
        {
          this.walletSeedDump.seed !== '' && (
            <div style={{margin:'8px -16px 0 -16px',borderTop:'1px solid #e9e9e9'}}>
              <Row style={{padding:'0 16px 0 16px'}}>
                <Col span={24}>
                  <div style={{marginTop:'10px'}}>
                    <p><i className='material-icons md-20'>vpn_key</i>
                      <span className='input-label'>
                        <span className='text-dotted'>{this.walletSeedDump.seed}</span>
                      </span>
                    </p>
                  </div>
                </Col>
              </Row>
            </div>
          )
        }
      </div>
    )
  }

  render() {
    return (
      <Popover
        title='Dump the hierarchical deterministic wallet seed'
        trigger='click'
        placement='bottomLeft'
        content={this.popoverContent()}
        visible={this.walletSeedDump.popover === true}
        onVisibleChange={this.togglePopover}
      >
        <Button disabled={this.wallet.isLocked === true}>Dump wallet seed</Button>
      </Popover>
    )
  }
}

export default WalletSeedDump
