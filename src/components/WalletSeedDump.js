import React from 'react'
import { translate } from 'react-i18next'
import { action, computed, observable } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Button, Input } from 'antd'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('info', 'rpc') @observer

export default class WalletSeedDump extends React.Component {
  @observable error = false
  @observable seed = ''

  constructor (props) {
    super(props)
    this.t = props.t
    this.info = props.info
    this.rpc = props.rpc
  }

  /** Clear seed when component unmounts. */
  componentWillUnmount () {
    if (this.seed !== '') this.setSeed()
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
  dumpSeed = () => {
    this.rpc.execute([
      { method: 'dumpwalletseed', params: [] }
    ], (response) => {
      /** Handle result. */
      if (response[0].hasOwnProperty('result') === true) {
        this.setSeed(response[0].result)
      }

      /** Handle error. */
      if (response[0].hasOwnProperty('error') === true) {
        /** Convert error code to string. */
        switch (response[0].error.code) {
          /** -4 = error_code_wallet_error */
          case -4:
            this.setError('notDeterministic')
            break
        }
      }
    })
  }

  render () {
    return (
      <div>
        <div className='flex'>
          <i className='material-icons md-16'>fingerprint</i>
          <p>{this.t('wallet:seedDumpLong')}</p>
        </div>
        <div className='flex-sb' style={{margin: '10px 0 0 0'}}>
          <p style={{width: '120px'}}>{this.t('wallet:seed')}</p>
          <Input
            disabled={this.seed === ''}
            readOnly
            style={{flex: 1}}
            value={this.seed}
          />
        </div>
        <div className='flex-sb' style={{margin: '5px 0 0 0'}}>
          <p className='red' style={{margin: '0 0 0 120px'}}>
            {
              this.errorStatus === 'notDeterministic' &&
              this.t('wallet:notDeterministic')
            }
          </p>
          <Button
            disabled={this.errorStatus !== false || this.info.isLocked === true}
            onClick={this.dumpSeed}
          >
            {this.t('wallet:seedDump')}
          </Button>
        </div>
      </div>
    )
  }
}
