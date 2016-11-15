import React from 'react'
import { observer } from 'mobx-react'
import { Button, Col, Popover, Row } from 'antd'
import { dataPath } from '../utilities/common'

/** Make the component reactive and inject MobX stores. */
@observer(['wallet', 'walletDump'])

class WalletDump extends React.Component {
  constructor(props) {
    super(props)
    this.wallet = props.wallet
    this.walletDump = props.walletDump
    this.dumpwallet = this.dumpwallet.bind(this)
    this.togglePopover = this.togglePopover.bind(this)
  }

  dumpwallet() {
    this.walletDump.dumpwallet()
    this.walletDump.togglePopover()
  }

  togglePopover() {
    this.walletDump.togglePopover()
  }

  popoverContent() {
    return (
      <Row style={{width:'370px'}}>
        <Col span={24}>
          <p style={{textAlign:'justify', marginBottom:'10px'}}>
            Public and private key combinations will be dumped into a <b><i>wallet.csv</i></b> file and saved in your Vcash data folder. The folder is located in:
          </p>
          <b>{dataPath()}</b>
          <p style={{textAlign:'justify'}} className='error-text'>
            Make sure not to move or alter other files in the data folder. Do not leave your wallet.csv exposed, remember to clean up afterwards.
          </p>
          <Row style={{marginTop:'10px'}}>
            <Col span={24} className='text-right'>
              <Button onClick={this.togglePopover}>Cancel</Button>
              <Button onClick={this.dumpwallet} style={{marginLeft:'10px'}}>I understand, dump the wallet</Button>
            </Col>
          </Row>
        </Col>
      </Row>
    )
  }

  render() {
    return (
      <Popover
        title='You are about to dump the whole wallet'
        trigger='click'
        placement='bottomLeft'
        content={this.popoverContent()}
        visible={this.walletDump.popover === true}
        onVisibleChange={this.togglePopover}
      >
        <Button disabled={this.wallet.isLocked === true}>Dump wallet</Button>
      </Popover>
    )
  }
}

export default WalletDump
