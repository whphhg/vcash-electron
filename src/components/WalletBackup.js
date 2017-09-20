import React from 'react'
import { translate } from 'react-i18next'
import { action, computed, observable } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Button, Input, message } from 'antd'
import { remote } from 'electron'
import { join, sep } from 'path'
import { dataPath } from '../utilities/common'

/** Wallet backing up component. */
@translate(['wallet'], { wait: true })
@inject('rpc')
@observer
class WalletBackup extends React.Component {
  @observable path = ''
  @observable rpcError = ''

  constructor (props) {
    super(props)
    this.t = props.t
    this.rpc = props.rpc
    this.path =
      this.rpc.connection.status.tunnel === true
        ? ''
        : join(dataPath(), 'backups', sep)

    /** Errors that will be shown to the user. */
    this.errShow = ['backupFailed']
  }

  /**
   * Get present error or empty string if none.
   * @function errorStatus
   * @return {string} Error status.
   */
  @computed
  get errorStatus () {
    if (this.rpcError !== '') return this.rpcError
    return ''
  }

  /**
   * Set value(s) of observable properties.
   * @function setValues
   * @param {object} values - Key value combinations.
   */
  @action
  setValues = values => {
    const allowed = ['path', 'rpcError']

    /** Set only values of allowed properties that differ from the present. */
    Object.keys(values).forEach(key => {
      if (allowed.includes(key) === true && this[key] !== values[key]) {
        this[key] = values[key]
      }
    })
  }

  /**
   * Get backup path.
   * @function getPath
   */
  getPath = () => {
    /** Open directory browser. */
    const selected = remote.dialog.showOpenDialog({
      properties: ['openDirectory']
    })

    /** Set selected path. */
    if (typeof selected !== 'undefined') {
      this.setValues({ path: join(selected[0], sep) })
    }
  }

  /**
   * Backup the wallet.
   * @function backupWallet
   */
  backupWallet = () => {
    this.rpc.execute(
      [{ method: 'backupwallet', params: [this.path] }],
      response => {
        if (response[0].hasOwnProperty('result') === true) {
          /** Display a success message for 6 seconds. */
          message.success(this.t('wallet:backedUp'), 6)
        }

        if (response[0].hasOwnProperty('error') === true) {
          switch (response[0].error.code) {
            case -4:
              return this.setValues({ rpcError: 'backupFailed' })
          }
        }
      }
    )
  }

  render () {
    return (
      <div>
        <div className='flex'>
          <i className='material-icons md-16'>save</i>
          <p>
            {this.t('wallet:backupLong')}
          </p>
        </div>
        <div className='flex-sb' style={{ margin: '10px 0 0 0' }}>
          <p style={{ width: '120px' }}>
            {this.t('wallet:saveInto')}
          </p>
          <Input
            disabled
            style={{ flex: 1 }}
            value={
              this.rpc.connection.status.tunnel === true
                ? this.t('wallet:remoteDataFolder')
                : this.path
            }
          />
        </div>
        <div
          className='flex-sb'
          style={{ alignItems: 'flex-start', margin: '5px 0 0 0' }}
        >
          <p className='red' style={{ margin: '0 0 0 120px' }}>
            {this.errShow.includes(this.errorStatus) === true &&
              this.t('wallet:' + this.errorStatus)}
          </p>
          <div className='flex' style={{ justifyContent: 'flex-end' }}>
            <Button
              disabled={this.rpc.connection.status.tunnel === true}
              onClick={this.getPath}
              style={{ margin: '0 5px 0 0' }}
            >
              {this.t('wallet:browse')}
            </Button>
            <Button onClick={this.backupWallet}>
              {this.t('wallet:backup')}
            </Button>
          </div>
        </div>
      </div>
    )
  }
}

export default WalletBackup
