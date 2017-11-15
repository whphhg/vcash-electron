import React from 'react'
import { translate } from 'react-i18next'
import { action, computed, extendObservable } from 'mobx'
import { inject, observer } from 'mobx-react'

/** Ant Design */
import Button from 'antd/lib/button'
import Input from 'antd/lib/input'

@translate(['wallet'])
@inject('rpc', 'wallet')
@observer
class WalletSeedDump extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.rpc = props.rpc
    this.wallet = props.wallet
    this.dumpWalletSeed = this.dumpWalletSeed.bind(this)

    /** Errors that will be shown to the user. */
    this.errShow = ['notDeterministic']

    /** Extend the component with observable properties. */
    extendObservable(this, { seed: '', rpcError: '' })
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
   * Dump wallet seed.
   * @function dumpWalletSeed
   */
  async dumpWalletSeed() {
    const res = await this.rpc.dumpWalletSeed()

    if ('result' in res === true) {
      this.setProps({ seed: res.result })
    }

    if ('error' in res === true) {
      switch (res.error.code) {
        case -4:
          return this.setProps({ rpcError: 'notDeterministic' })
      }
    }
  }

  render() {
    return (
      <div>
        <div className="flex">
          <i className="material-icons md-16">fingerprint</i>
          <p>{this.t('seedDumpDesc')}</p>
        </div>
        <div className="flex-sb" style={{ margin: '15px 0 10px 0' }}>
          <p style={{ width: '140px' }}>{this.t('seed')}</p>
          <Input
            disabled={this.seed === ''}
            readOnly
            style={{ flex: 1 }}
            value={this.seed}
          />
        </div>
        <div className="flex-sb">
          <p className="red" style={{ margin: '0 0 0 140px' }}>
            {this.errShow.includes(this.errorStatus) === true &&
              this.t(this.errorStatus)}
          </p>
          <Button
            disabled={this.errorStatus !== '' || this.wallet.isLocked === true}
            onClick={this.dumpWalletSeed}
          >
            {this.t('seedDump')}
          </Button>
        </div>
      </div>
    )
  }
}

export default WalletSeedDump
