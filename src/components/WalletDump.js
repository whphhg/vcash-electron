import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Button, Col, Input, Row } from 'antd'
import { dataPath } from '../utilities/common'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('wallet') @observer

class WalletDump extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.wallet = props.wallet
    this.dump = this.dump.bind(this)
  }

  dump () {
    this.wallet.dump()
  }

  render () {
    return (
      <div>
        <p style={{margin: '0 0 5px 0'}}>
          <i className='material-icons md-18'>assignment</i>
          <span className='text-icon'>
            {this.t('wallet:dumpLong')}
          </span>
        </p>
        <Row>
          <Col span={3}>
            <p style={{margin: '4px 0 0 0'}}>
              {this.t('wallet:saveInto')}
            </p>
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
              onClick={this.dump}
              disabled={this.wallet.isLocked === true}
            >
              {this.t('wallet:dump')}
            </Button>
          </Col>
        </Row>
      </div>
    )
  }
}

export default WalletDump
