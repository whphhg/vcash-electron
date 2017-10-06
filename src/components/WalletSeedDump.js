import React from 'react'
import { translate } from 'react-i18next'
import { action, computed, extendObservable } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Button, Input } from 'antd'

@translate(['wallet'], { wait: true })
@inject('rpcNext', 'wallet')
@observer
class WalletSeedDump extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.rpc = props.rpcNext
    this.wallet = props.wallet

    /** Extend the component with observable properties. */
    extendObservable(this, { seed: '', rpcError: '' })

    /** Bind the async function. */
    this.dumpWalletSeed = this.dumpWalletSeed.bind(this)

    /** Errors that will be shown to the user. */
    this.errShow = ['notDeterministic']
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
   * Dump wallet seed.
   * @function dumpWalletSeed
   */
  async dumpWalletSeed () {
    const res = await this.rpc.dumpWalletSeed()

    if ('result' in res === true) {
      /** Set wallet's seed. */
      this.setValues({ seed: res.result })
    }

    if ('error' in res === true) {
      switch (res.error.code) {
        case -4:
          return this.setValues({ rpcError: 'notDeterministic' })
      }
    }
  }

  render () {
    return (
      <div>
        <div className='flex'>
          <i className='material-icons md-16'>fingerprint</i>
          <p>{this.t('wallet:seedDumpLong')}</p>
        </div>
        <div className='flex-sb' style={{ margin: '10px 0 0 0' }}>
          <p style={{ width: '120px' }}>{this.t('wallet:seed')}</p>
          <Input
            disabled={this.seed === ''}
            readOnly
            style={{ flex: 1 }}
            value={this.seed}
          />
        </div>
        <div className='flex-sb' style={{ margin: '5px 0 0 0' }}>
          <p className='red' style={{ margin: '0 0 0 120px' }}>
            {this.errShow.includes(this.errorStatus) === true &&
              this.t('wallet:' + this.errorStatus)}
          </p>
          <Button
            disabled={this.errorStatus !== '' || this.wallet.isLocked === true}
            onClick={this.dumpWalletSeed}
          >
            {this.t('wallet:seedDump')}
          </Button>
        </div>
      </div>
    )
  }
}

export default WalletSeedDump
