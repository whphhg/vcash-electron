import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Button, Col, Input, Row, message } from 'antd'
import { dataPath } from '../utilities/common'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('info', 'rpc') @observer

export default class WalletDump extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.info = props.info
    this.rpc = props.rpc
  }

  /**
   * Dump the wallet.
   * @function dump
   */
  dump = () => {
    this.rpc.execute([
      { method: 'dumpwallet', params: [] }
    ], (response) => {
      /** Handle result. */
      if (response[0].hasOwnProperty('result') === true) {
        /** Display a success message. */
        message.success(this.t('wallet:dumped'), 6)
      }
    })
  }

  render () {
    return (
      <div>
        <p style={{margin: '0 0 5px 0'}}>
          <i className='material-icons md-18'>assignment</i>
          <span
            style={{
              margin: '0 0 0 7px',
              verticalAlign: 'top'
            }}
          >
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
          <Col style={{textAlign: 'right'}}>
            <Button
              style={{margin: '5px 0 0 0'}}
              onClick={this.dump}
              disabled={this.info.isLocked === true}
            >
              {this.t('wallet:dump')}
            </Button>
          </Col>
        </Row>
      </div>
    )
  }
}
