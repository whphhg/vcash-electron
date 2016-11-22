import React from 'react'
import { inject, observer } from 'mobx-react'
import { Button, Col, Input, Row } from 'antd'

/** Make the component reactive and inject MobX stores. */
@inject('walletBackup') @observer

class WalletBackup extends React.Component {
  constructor(props) {
    super(props)
    this.walletBackup = props.walletBackup
    this.backupwallet = this.backupwallet.bind(this)
    this.getPath = this.getPath.bind(this)
  }

  backupwallet() {
    this.walletBackup.backupwallet()
  }

  getPath() {
    this.walletBackup.getPath()
  }

  render() {
    return (
      <div>
        <p style={{margin: '0 0 5px 0'}}>
          <i className='material-icons md-18'>save</i>
          <span className='text-icon'>Make a timestamped wallet backup</span>
        </p>
        <Row>
          <Col span={3}>
            <p style={{margin: '4px 0 0 0'}}>Save into</p>
          </Col>
          <Col span={21}>
            <Input
              disabled
              value={this.walletBackup.path}
            />
          </Col>
        </Row>
        <Row>
          <Col offset={3} span={12}>
            {
              this.walletBackup.errorStatus === 'backupFailed' && (
                <p className='text-error'>Recently changed the passphrase? Please restart the wallet.</p>
              )
            }
          </Col>
          <Col span={9} className='text-right'>
            <Button
              style={{margin: '5px 0 0 0'}}
              onClick={this.getPath}
            >
              Browse
            </Button>
            <Button
              style={{margin: '5px 0 0 5px'}}
              onClick={this.backupwallet}
            >
              Make a backup
            </Button>
          </Col>
        </Row>
      </div>
    )
  }
}

export default WalletBackup
