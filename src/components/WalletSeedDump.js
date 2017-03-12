import React from 'react'
import { translate } from 'react-i18next'
import { action, computed, observable } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Button, Col, Input, Row } from 'antd'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('info', 'rpc') @observer

export default class WalletSeedDump extends React.Component {
  @observable seed = ''
  @observable error = false

  constructor (props) {
    super(props)
    this.t = props.t
    this.info = props.info
    this.rpc = props.rpc
  }

  /** Clear seed when component unmounts. */
  componentWillUnmount () {
    if (this.seed !== '') {
      this.setSeed()
    }
  }

  /**
   * Get error status.
   * @function errorStatus
   * @return {string|false} Current error or false if none.
   */
  @computed get errorStatus () {
    if (this.error !== false) return this.error
    return false
  }

  /**
   * Set rpc error.
   * @function setError
   * @param {string} error - RPC error.
   */
  @action setError = (error = false) => {
    this.error = error
  }

  /**
   * Set wallet seed.
   * @function setSeed
   * @param {string} seed - Wallet seed.
   */
  @action setSeed = (seed = '') => {
    this.seed = seed
  }

  /**
   * Dump wallet seed.
   * @function dumpSeed
   */
  @action dumpSeed = () => {
    this.rpc.dumpWalletSeed((result, error) => {
      if (result !== undefined) {
        this.setSeed(result)
      }

      if (error !== this.error) {
        this.setError(error)
      }
    })
  }

  render () {
    return (
      <div>
        <p style={{margin: '0 0 5px 0'}}>
          <i className='material-icons md-18'>fingerprint</i>
          <span
            style={{
              margin: '0 0 0 7px',
              verticalAlign: 'top'
            }}
          >
            {this.t('wallet:seedDumpLong')}
          </span>
        </p>
        <Row>
          <Col span={3}>
            <p style={{margin: '4px 0 0 0'}}>
              {this.t('wallet:seed')}
            </p>
          </Col>
          <Col span={21}>
            <Input
              value={this.seed}
              disabled={this.seed === ''}
              readOnly
            />
          </Col>
        </Row>
        <Row>
          <Col span={13} offset={3}>
            <p className='red' style={{margin: '3px 0 3px 1px'}}>
              {
                this.errorStatus === 'notDeterministic' &&
                this.t('wallet:notDeterministic')
              }
            </p>
          </Col>
          <Col span={8} style={{textAlign: 'right'}}>
            <Button
              style={{margin: '5px 0 0 0'}}
              onClick={this.dumpSeed}
              disabled={
                this.errorStatus !== false ||
                this.info.isLocked === true
              }
            >
              {this.t('wallet:seedDump')}
            </Button>
          </Col>
        </Row>
      </div>
    )
  }
}
