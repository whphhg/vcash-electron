import React from 'react'
import { translate } from 'react-i18next'
import { action, computed, extendObservable } from 'mobx'
import { inject, observer } from 'mobx-react'
import { remote } from 'electron'
import { join, sep } from 'path'
import { dataPath } from '../../utilities/common.js'

/** Ant Design */
import Button from 'antd/lib/button'
import Input from 'antd/lib/input'
import message from 'antd/lib/message'

@translate(['common'])
@inject('rpc')
@observer
class WalletBackup extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.rpc = props.rpc
    this.backupWallet = this.backupWallet.bind(this)

    /** Errors that will be shown to the user. */
    this.errShow = ['backupFailed']

    /** Extend the component with observable properties. */
    extendObservable(this, {
      path:
        this.rpc.connection.status.tunnel === true
          ? ''
          : join(dataPath(), 'backups', sep),
      rpcError: ''
    })
  }

  /**
   * Get present error or empty string if none.
   * @function errorStatus
   * @return {string} Error status.
   */
  @computed
  get errorStatus() {
    if (this.rpcError !== '') return this.rpcError
    return ''
  }

  /**
   * Set observable properties.
   * @function setProps
   * @param {object} props - Key value combinations.
   */
  @action
  setProps = props => {
    Object.keys(props).forEach(key => (this[key] = props[key]))
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
      this.setProps({ path: join(selected[0], sep) })
    }
  }

  /**
   * Backup the wallet.
   * @function backupWallet
   */
  async backupWallet() {
    const res = await this.rpc.backupWallet(this.path)

    if ('result' in res === true) {
      message.success(this.t('backedUp'))
    }

    if ('error' in res === true) {
      switch (res.error.code) {
        case -4:
          return this.setProps({ rpcError: 'backupFailed' })
      }
    }
  }

  render() {
    return (
      <div>
        <div className="flex">
          <i className="material-icons md-16">save</i>
          <p>{this.t('backupDesc')}</p>
        </div>
        <div className="flex-sb" style={{ margin: '15px 0 10px 0' }}>
          <p style={{ width: '140px' }}>{this.t('saveInto')}</p>
          <Input
            disabled
            style={{ flex: 1 }}
            value={
              this.rpc.connection.status.tunnel === true
                ? this.t('remoteDataFolder')
                : this.path
            }
          />
        </div>
        <div className="flex-sb" style={{ alignItems: 'flex-start' }}>
          <p className="red" style={{ margin: '0 0 0 140px' }}>
            {this.errShow.includes(this.errorStatus) === true &&
              this.t(this.errorStatus)}
          </p>
          <div className="flex" style={{ justifyContent: 'flex-end' }}>
            <Button
              disabled={this.rpc.connection.status.tunnel === true}
              onClick={this.getPath}
              style={{ margin: '0 5px 0 0' }}
            >
              {this.t('browse')}
            </Button>
            <Button onClick={this.backupWallet}>{this.t('backup')}</Button>
          </div>
        </div>
      </div>
    )
  }
}

export default WalletBackup
