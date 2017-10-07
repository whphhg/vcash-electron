import React from 'react'
import { translate } from 'react-i18next'
import { action, computed, extendObservable } from 'mobx'
import { inject, observer } from 'mobx-react'
import { remote } from 'electron'
import { join, sep } from 'path'
import { dataPath } from '../utilities/common'

/** Ant Design */
import Button from 'antd/lib/button'
import Input from 'antd/lib/input'
import message from 'antd/lib/message'

@translate(['wallet'], { wait: true })
@inject('rpcNext')
@observer
class WalletBackup extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.rpc = props.rpcNext

    /** Extend the component with observable properties. */
    extendObservable(this, {
      path:
        this.rpc.conn.status.tunnel === true
          ? ''
          : join(dataPath(), 'backups', sep),
      rpcError: ''
    })

    /** Bind the async function. */
    this.backupWallet = this.backupWallet.bind(this)

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
    Object.keys(values).forEach(key => {
      this[key] = values[key]
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
  async backupWallet () {
    const res = await this.rpc.backupWallet(this.path)

    if ('result' in res === true) {
      /** Display a success message for 6s. */
      message.success(this.t('wallet:backedUp'), 6)
    }

    if ('error' in res === true) {
      switch (res.error.code) {
        case -4:
          return this.setValues({ rpcError: 'backupFailed' })
      }
    }
  }

  render () {
    return (
      <div>
        <div className='flex'>
          <i className='material-icons md-16'>save</i>
          <p>{this.t('wallet:backupLong')}</p>
        </div>
        <div className='flex-sb' style={{ margin: '10px 0 0 0' }}>
          <p style={{ width: '120px' }}>{this.t('wallet:saveInto')}</p>
          <Input
            disabled
            style={{ flex: 1 }}
            value={
              this.rpc.conn.status.tunnel === true
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
              disabled={this.rpc.conn.status.tunnel === true}
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
