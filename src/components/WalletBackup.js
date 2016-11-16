import React from 'react'
import { observer } from 'mobx-react'
import { Button, Col, Input, Popover, Row } from 'antd'

/** Make the component reactive and inject MobX stores. */
@observer(['wallet', 'walletBackup'])

class WalletBackup extends React.Component {
  constructor(props) {
    super(props)
    this.wallet = props.wallet
    this.walletBackup = props.walletBackup
    this.backupwallet = this.backupwallet.bind(this)
    this.getPath = this.getPath.bind(this)
    this.togglePopover = this.togglePopover.bind(this)
  }

  backupwallet() {
    this.walletBackup.backupwallet()
  }

  getPath() {
    this.walletBackup.getPath()
  }

  togglePopover() {
    this.walletBackup.togglePopover()
  }

  popoverContent() {
    return (
      <div style={{width:'370px'}}>
        <Row>
          <Col span={24}>
            <Input disabled={true} value={this.walletBackup.path} />
            {
              this.walletBackup.errorStatus === 'backupFailed' && (
                <p className='text-error'>Backup failed. Wallet restart necessary.</p>
              )
            }
          </Col>
        </Row>
        <Row style={{marginTop:'10px'}}>
          <Col span={24} className='text-right'>
            <Button onClick={this.getPath}>Browse</Button>
            <Button onClick={this.backupwallet} style={{marginLeft:'10px'}}>Backup wallet</Button>
          </Col>
        </Row>
      </div>
    )
  }

  render() {
    return (
      <Popover
        title='Save timestamped wallet backup into the folder below'
        trigger='click'
        placement='bottomLeft'
        content={this.popoverContent()}
        visible={this.walletBackup.popover === true}
        onVisibleChange={this.togglePopover}
      >
        <Button disabled={this.wallet.isLocked === true}>Backup wallet</Button>
      </Popover>
    )
  }
}

export default WalletBackup
