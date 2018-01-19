import React from 'react'
import { translate } from 'react-i18next'
import { action, extendObservable } from 'mobx'
import { inject, observer } from 'mobx-react'

/** Ant Design */
import Button from 'antd/lib/button'

@translate(['common'])
@inject('gui', 'rpc')
@observer
class WalletRepair extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.rpc = props.rpc
    this.crWallet = this.crWallet.bind(this)

    /** Extend the component with observable properties. */
    extendObservable(this, {
      amountAffected: 0,
      checkPassed: null,
      mismatchedSpent: 0
    })

    /** Check the wallet when component loads. */
    this.crWallet()
  }

  /**
   * Set observable properties.
   * @function setProps
   * @param {object} props - Key value combinations.
   */
  @action
  setProps(props) {
    Object.keys(props).forEach(key => (this[key] = props[key]))
  }

  /**
   * Check for and repair wallet inconsistencies.
   * @function crWallet
   * @param {boolean} checkOnly - Check for inconsistencies without repairing.
   */
  async crWallet(checkOnly = true) {
    const method = checkOnly === true ? 'checkWallet' : 'repairWallet'
    const res = await this.rpc[method]()

    if ('result' in res === true) {
      const result = res.result
      const cp = 'wallet check passed' in result

      /** Re-check after repairing. */
      if (this.checkPassed === false && cp === false) return this.crWallet()

      /** Set checkPassed, amount affected and mismatched spent. */
      this.setProps({
        amountAffected: cp === true ? 0 : result['amount affected by repair'],
        checkPassed: cp,
        mismatchedSpent: cp === true ? 0 : result['mismatched spent coins']
      })
    }
  }

  render() {
    return (
      <div>
        <div className="flex">
          <i className="material-icons md-16">build</i>
          <p>{this.t('repairDesc')}</p>
        </div>
        <div className="flex-sb" style={{ margin: '15px 0 0 0' }}>
          <p style={{ width: '140px' }}>{this.t('status')}</p>
          {this.checkPassed !== false && (
            <div className="flex-sb" style={{ flex: 1 }}>
              <div>
                {this.checkPassed !== null && <p>{this.t('checkPassed')}</p>}
              </div>
              <Button onClick={this.crWallet}>{this.t('check')}</Button>
            </div>
          )}
          {this.checkPassed === false && (
            <div className="flex-sb" style={{ flex: 1 }}>
              <div>
                <div className="flex-sb">
                  <p style={{ margin: '0 36px 0 0' }}>
                    {this.t('mismatched')}:{' '}
                    <span style={{ fontWeight: '500' }}>
                      {new Intl.NumberFormat(this.gui.language, {
                        maximumFractionDigits: 6
                      }).format(this.mismatchedSpent)}{' '}
                      XVC
                    </span>
                  </p>
                  <p>
                    {this.t('amountAffected')}:{' '}
                    <span style={{ fontWeight: '500' }}>
                      {new Intl.NumberFormat(this.gui.language, {
                        maximumFractionDigits: 6
                      }).format(this.amountAffected)}{' '}
                      XVC
                    </span>
                  </p>
                </div>
              </div>
              <Button onClick={() => this.crWallet(false)}>
                {this.t('repair')}
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default WalletRepair
