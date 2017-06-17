import React from 'react'
import { translate } from 'react-i18next'
import { action, observable } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Button } from 'antd'

@translate(['wallet'], { wait: true })
@inject('gui', 'rpc')
@observer
class WalletRepair extends React.Component {
  @observable amountAffected = 0
  @observable checkPassed = null
  @observable mismatchedSpent = 0

  constructor (props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.rpc = props.rpc

    /** Check the wallet as soon as component loads. */
    this.repair()
  }

  /**
   * Set RPC response.
   * @function setResponse
   * @param {object} response - RPC response.
   */
  @action
  setResponse = response => {
    /** Re-check after repairing. */
    if (
      this.checkPassed === false &&
      response.hasOwnProperty('wallet check passed') === false
    ) {
      return this.repair()
    }

    /** Update check passed status. */
    this.checkPassed = response.hasOwnProperty('wallet check passed')

    /** Set or reset amount affected by repair. */
    this.amountAffected = this.checkPassed === true
      ? 0
      : response['amount affected by repair']

    /** Set or reset mismatched spent amount. */
    this.mismatchedSpent = this.checkPassed === true
      ? 0
      : response['mismatched spent coins']
  }

  /**
   * Check for and repair wallet inconsistencies.
   * @function repair
   * @param {boolean} checkOnly - Check for inconsistencies without repairing.
   */
  repair = (checkOnly = true) => {
    const method = checkOnly === true ? 'checkwallet' : 'repairwallet'

    this.rpc.execute([{ method, params: [] }], response => {
      /** Set checkPassed and potential mismatched & amount affected. */
      if (response[0].hasOwnProperty('result') === true) {
        this.setResponse(response[0].result)
      }
    })
  }

  render () {
    return (
      <div>
        <div className='flex'>
          <i className='material-icons md-16'>build</i>
          <p>{this.t('wallet:repairLong')}</p>
        </div>
        <div style={{ margin: '10px 0 0 0' }}>
          {this.checkPassed !== false &&
            <div className='flex-sb'>
              <div>
                {this.checkPassed !== null &&
                  <p>{this.t('wallet:checkPassed')}</p>}
              </div>
              <Button onClick={() => this.repair()}>
                {this.t('wallet:check')}
              </Button>
            </div>}
          {this.checkPassed === false &&
            <div className='flex-sb'>
              <div>
                <div className='flex-sb'>
                  <p style={{ margin: '0 36px 0 0' }}>
                    {this.t('wallet:mismatched')}:{' '}
                    <span style={{ fontWeight: '500' }}>
                      {new Intl.NumberFormat(this.gui.language, {
                        maximumFractionDigits: 6
                      }).format(this.mismatchedSpent)}{' '}
                      XVC
                    </span>
                  </p>
                  <p>
                    {this.t('wallet:amountAffected')}:{' '}
                    <span style={{ fontWeight: '500' }}>
                      {new Intl.NumberFormat(this.gui.language, {
                        maximumFractionDigits: 6
                      }).format(this.amountAffected)}{' '}
                      XVC
                    </span>
                  </p>
                </div>
              </div>
              <Button onClick={() => this.repair(false)}>
                {this.t('wallet:repair')}
              </Button>
            </div>}
        </div>
      </div>
    )
  }
}

export default WalletRepair
