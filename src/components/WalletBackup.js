import React from 'react'
import { translate } from 'react-i18next'
import { action, computed, observable } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Button, Input, message } from 'antd'
import { remote } from 'electron'
import { join, sep } from 'path'
import { dataPath } from '../utilities/common'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive. */
@inject('rpc') @observer

export default class WalletBackup extends React.Component {
  @observable error = false
  @observable path

  constructor (props) {
    super(props)
    this.t = props.t
    this.rpc = props.rpc
    this.path = this.rpc.connection.status.tunnel === true
      ? ''
      : join(dataPath(), 'backups', sep)
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
   * Set RPC error.
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
      this.path = join(selected[0], sep)
    }
  }

  /**
   * Backup the wallet.
   * @function backup
   */
  backup = () => {
    this.rpc.execute([
      { method: 'backupwallet', params: [this.path] }
    ], (response) => {
      /** Display a success message. */
      if (response[0].hasOwnProperty('result') === true) {
        message.success(this.t('wallet:backedUp'), 6)
      }

      /** Set error. */
      if (response[0].hasOwnProperty('error') === true) {
        switch (response[0].error.code) {
          /** error_code_wallet_error */
          case -4:
            return this.setError('backupFailed')
        }
      }
    })
  }

  render () {
    return (
      <div>
        <div className='flex'>
          <i className='material-icons md-16'>save</i>
          <p>{this.t('wallet:backupLong')}</p>
        </div>
        <div className='flex-sb' style={{margin: '10px 0 0 0'}}>
          <p style={{width: '120px'}}>{this.t('wallet:saveInto')}</p>
          <Input
            disabled
            style={{flex: 1}}
            value={
              this.rpc.connection.status.tunnel === true
                ? this.t('wallet:remoteDataFolder')
                : this.path
            }
          />
        </div>
        <div
          className='flex-sb'
          style={{alignItems: 'flex-start', margin: '5px 0 0 0'}}
        >
          <p className='red' style={{margin: '0 0 0 120px'}}>
            {
              this.errorStatus === 'backupFailed' &&
              this.t('wallet:backupFailed')
            }
          </p>
          <div className='flex' style={{justifyContent: 'flex-end'}}>
            <Button
              disabled={this.rpc.connection.status.tunnel === true}
              onClick={this.setPath}
              style={{margin: '0 5px 0 0'}}
            >
              {this.t('wallet:browse')}
            </Button>
            <Button onClick={this.backup}>{this.t('wallet:backup')}</Button>
          </div>
        </div>
      </div>
    )
  }
}
