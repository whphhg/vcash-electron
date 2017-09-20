import React from 'react'
import { translate } from 'react-i18next'
import { action, computed, observable } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Button, Input } from 'antd'

/** Wallet seed dumping component. */
@translate(['wallet'], { wait: true })
@inject('rpc', 'wallet')
@observer
class WalletSeedDump extends React.Component {
  @observable seed = ''
  @observable rpcError = ''

  constructor (props) {
    super(props)
    this.t = props.t
    this.rpc = props.rpc
    this.wallet = props.wallet

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
    const allowed = ['seed', 'rpcError']

    /** Set only values of allowed properties that differ from the present. */
    Object.keys(values).forEach(key => {
      if (allowed.includes(key) === true && this[key] !== values[key]) {
        this[key] = values[key]
      }
    })
  }

  /**
   * Dump wallet seed.
   * @function dumpWalletSeed
   */
  dumpWalletSeed = () => {
    this.rpc.execute([{ method: 'dumpwalletseed', params: [] }], response => {
      if (response[0].hasOwnProperty('result') === true) {
        /** Set wallet's seed. */
        this.setValues({ seed: response[0].result })
      }

      if (response[0].hasOwnProperty('error') === true) {
        switch (response[0].error.code) {
          case -4:
            return this.setValues({ rpcError: 'notDeterministic' })
        }
      }
    })
  }

  render () {
    return (
      <div>
        <div className='flex'>
          <i className='material-icons md-16'>fingerprint</i>
          <p>
            {this.t('wallet:seedDumpLong')}
          </p>
        </div>
        <div className='flex-sb' style={{ margin: '10px 0 0 0' }}>
          <p style={{ width: '120px' }}>
            {this.t('wallet:seed')}
          </p>
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
