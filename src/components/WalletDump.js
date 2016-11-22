import React from 'react'
import { inject, observer } from 'mobx-react'
import { Button, Col, Input, Row } from 'antd'
import { dataPath } from '../utilities/common'

/** Make the component reactive and inject MobX stores. */
@inject('wallet') @observer

class WalletDump extends React.Component {
  constructor(props) {
    super(props)
    this.wallet = props.wallet
    this.dumpwallet = this.dumpwallet.bind(this)
  }

  dumpwallet() {
    this.wallet.dumpwallet()
  }

  render() {
    return (
      <div>
        <p style={{margin: '0 0 5px 0'}}>
          <i className='material-icons md-18'>assignment</i>
          <span className='text-icon'>Dump public and private key combinations into a wallet<b>.CSV</b> file</span>
        </p>
        <Row>
          <Col span={3}>
            <p style={{margin: '4px 0 0 0'}}>Save into</p>
          </Col>
          <Col span={21}>
            <Input
              disabled
              value={dataPath()}
            />
          </Col>
        </Row>
        <Row>
          <Col className='text-right'>
            <Button
              style={{margin: '5px 0 0 0'}}
              onClick={this.dumpwallet}
              disabled={this.wallet.isLocked === true}
            >
              Dump the wallet
            </Button>
          </Col>
        </Row>
      </div>
    )
  }
}

export default WalletDump
