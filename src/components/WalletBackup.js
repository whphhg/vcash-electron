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
@inject('wallet') @observer

class WalletBackup extends React.Component {
  @observable path = dataPath()
  @observable error = false

  constructor (props) {
    super(props)
    this.t = props.t
    this.wallet = props.wallet
    this.backup = this.backup.bind(this)
    this.setPath = this.setPath.bind(this)
  }

  @computed get errorStatus () {
    if (this.error !== false) return this.error
    return false
  }

  @action setError (error = false) {
    this.error = error
  }

  @action setPath () {
    /** Open directory browser. */
    const selected = remote.dialog.showOpenDialog({
      properties: ['openDirectory']
    })

    /** Set selected path. */
    if (typeof selected !== 'undefined') {
      this.path = selected[0] + sep
    }
  }

  backup () {
    this.wallet.backup(this.path, (result, error) => {
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
          <span className='text-icon'>
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
          <Col offset={3} span={12}>
            <p className='text-error'>
              {
                this.errorStatus === 'backupFailed' &&
                this.t('wallet:backupFailed')
              }
            </p>
          </Col>
          <Col span={9} className='text-right'>
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

export default WalletBackup
