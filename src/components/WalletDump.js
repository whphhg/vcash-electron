import React from 'react'
import { inject, observer } from 'mobx-react'
import { Button, Col, Popconfirm, Popover, Row } from 'antd'

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
  }

  togglePopover() {
    this.walletDump.togglePopover()
  }

  popoverContent() {
    return (
      <Row style={{width:'370px'}}>
        <Col span={24}>
          <p style={{textAlign:'justify'}}>
            Public and private key combinations will be dumped into a <b><i>wallet.csv</i></b> file and saved in your Vcash data folder. The folder is located in:
          </p>
          <Row style={{marginTop:'10px'}}>
            <Col span={5} offset={1}>
              <p>Linux</p>
              <p>OS X</p>
              <p>Windows</p>
            </Col>
            <Col span={18}>
              <p><b>~/.Vcash/data</b></p>
              <p><b>~/Library/Application Support/Vcash/data</b></p>
              <p><b>%APPDATA%\Vcash\data</b></p>
            </Col>
          </Row>
          <p style={{textAlign:'justify'}} className='error-text'>
            Make sure not to move or alter other files in the data folder. Do not leave your private keys exposed, remember to clean up afterwards.
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
        title='You are about to dump your whole wallet'
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
