import React from 'react'
import { translate } from 'react-i18next'
import { action, computed, observable } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Button, Col, Input, Row } from 'antd'
import { remote } from 'electron'
import { sep } from 'path'
import { dataPath } from '../utilities/common'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive. */
@inject('rpc') @observer

export default class WalletBackup extends React.Component {
  @observable path = dataPath()
  @observable error = false

  constructor (props) {
    super(props)
    this.t = props.t
    this.rpc = props.rpc
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
   * Set backup path.
   * @function setPath
   */
  @action setPath = () => {
    /** Open directory browser. */
    const selected = remote.dialog.showOpenDialog({
      properties: ['openDirectory']
    })

    /** Set selected path. */
    if (typeof selected !== 'undefined') {
      this.path = selected[0] + sep
    }
  }

  /**
   * Backup the wallet.
   * @function backup
   */
  backup = () => {
    this.rpc.backupWallet(this.path, (result, error) => {
      if (error !== this.error) {
        this.setError(error)
      }
    })
  }

  render () {
    return (
      <div>
        <p style={{margin: '0 0 5px 0'}}>
          <i className='material-icons md-18'>save</i>
          <span
            style={{
              margin: '0 0 0 7px',
              verticalAlign: 'top'
            }}
          >
            {this.t('wallet:backupLong')}
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
              value={this.path}
            />
          </Col>
        </Row>
        <Row>
          <Col span={12} offset={3}>
            <p className='red' style={{margin: '3px 0 3px 1px'}}>
              {
                this.errorStatus === 'backupFailed' &&
                this.t('wallet:backupFailed')
              }
            </p>
          </Col>
          <Col span={9} style={{textAlign: 'right'}}>
            <Button
              style={{margin: '5px 0 0 0'}}
              onClick={this.setPath}
            >
              {this.t('wallet:browse')}
            </Button>
            <Button
              style={{margin: '5px 0 0 5px'}}
              onClick={this.backup}
            >
              {this.t('wallet:backup')}
            </Button>
          </Col>
        </Row>
      </div>
    )
  }
}
