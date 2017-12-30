import React from 'react'
import { translate } from 'react-i18next'
import { computed } from 'mobx'
import { inject, observer } from 'mobx-react'
import moment from 'moment'

/** Components */
import TransactionIoList from '../lists/TransactionIoList'
import { Placeholder } from '../utilities/Common'

@translate(['wallet'])
@inject('gui', 'rates', 'rpc', 'wallet')
@observer
class Transaction extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.rates = props.rates
    this.rpc = props.rpc
    this.wallet = props.wallet
    this.ztLock = this.ztLock.bind(this)
  }

  /**
   * Cleanup and normalize vin and vout arrays.
   * @function io
   * @return {array} Inputs and outputs.
   */
  @computed
  get io() {
    if (this.wallet.tx.has(this.wallet.viewing.tx) === false) return []
    const tx = this.wallet.tx.get(this.wallet.viewing.tx)

    /** Prepare inputs and remove coinbase (PoW) if present. */
    const vin = tx.vin.reduce((vin, input) => {
      if ('coinbase' in input === true) return vin

      vin.push({ address: input.address, amount: input.value })
      return vin
    }, [])

    /** Prepare outputs and remove nonstandard (PoS) if present. */
    const vout = tx.vout.reduce((vout, output) => {
      if (output.scriptPubKey.type === 'nonstandard') return vout

      vout.push({
        address: output.scriptPubKey.addresses[0],
        amount: output.value
      })

      /** Add color prop, indicating the output is spendable or spent. */
      if ('spentTxid' in output === true) {
        vout[vout.length - 1].color = output.spentTxid === '' ? 'green' : 'red'
      }

      return vout
    }, [])

    return { vin, vout }
  }

  /**
   * Lock viewing transaction.
   * @function ztLock
   */
  async ztLock() {
    const res = await this.rpc.ztLock(this.wallet.viewing.tx)
    if ('result' in res === true) this.wallet.updateWallet()
  }

  render() {
    /** Do not render if the transaction does not exist. */
    if (this.wallet.tx.has(this.wallet.viewing.tx) === false) return null

    /** Render a placeholder if this is a wallet without transactions (new). */
    if (this.wallet.txKeys.length === 0) {
      return (
        <Placeholder
          t={this.t}
          icon="send"
          string="addrFind"
          style={{ margin: '69px 0 0 0' }}
          wallet={this.wallet}
        />
      )
    }

    const { average, local } = this.rates
    const tx = this.wallet.tx.get(this.wallet.viewing.tx)

    return (
      <div style={{ lineHeight: '20px' }}>
        <div className="flex-sb" style={{ alignItems: 'flex-start' }}>
          <div style={{ margin: '0 50px 0 0' }}>
            <div className="flex">
              <i className="material-icons md-16">label</i>
              <p>{this.t('txId')}</p>
            </div>
            {'blockhash' in tx === true && (
              <div className="flex">
                <i className="material-icons md-16">extension</i>
                <p>{this.t('includedInBlock')}</p>
              </div>
            )}
            <div className="flex">
              <i className="material-icons md-16">access_time</i>
              <p>{this.t('relayedOn')}</p>
            </div>
            {'blocktime' in tx === true &&
              tx.blocktime > 0 && (
                <div className="flex">
                  <i className="material-icons md-16">access_time</i>
                  <p>{this.t('blockFound')}</p>
                </div>
              )}
            <div className="flex">
              <i className="material-icons md-16">folder</i>
              <p>{this.t('category')}</p>
            </div>
            <div className="flex" style={{ margin: '10px 0 0 0' }}>
              <i className="material-icons md-16">monetization_on</i>
              <p>{this.t('amount')}</p>
            </div>
            {'fee' in tx === true && (
              <div className="flex">
                <i className="material-icons md-16">card_giftcard</i>
                <p>{this.t('fee')}</p>
              </div>
            )}
            <div className="flex">
              <i className="material-icons md-16">done_all</i>
              <p>{this.t('confirmations')}</p>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="flex-sb" style={{ alignItems: 'flex-start' }}>
              <div style={{ margin: '0 0 10px 0' }}>
                <p style={{ fontWeight: '500' }}>
                  <a
                    className="alt"
                    target="_blank"
                    href={'https://explorer.vcash.info/tx/' + tx.txid}
                  >
                    {tx.txid}
                  </a>
                </p>
                {'blockhash' in tx === true && (
                  <p style={{ fontWeight: '500' }}>
                    <a
                      className="alt"
                      disabled={tx.blockhash === '0'.repeat(64)}
                      href={'https://explorer.vcash.info/block/' + tx.blockhash}
                      target="_blank"
                    >
                      {tx.blockhash}
                    </a>
                  </p>
                )}
                <p>
                  {moment(tx.time).format('L - LTS')} (
                  {moment().to(tx.time)})
                </p>
                {'blocktime' in tx === true &&
                  tx.blocktime > 0 && (
                    <p>{moment(tx.blocktime).format('L - LTS')}</p>
                  )}
                <p style={{ fontWeight: '500' }}>{this.t(tx.category)}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                {'ztlock' in tx === true &&
                  tx.confirmations === 0 &&
                  'generated' in tx === false &&
                  'blended' in tx === false && (
                    <p>
                      <a disabled={tx.ztlock === true} onClick={this.ztLock}>
                        {this.t(tx.ztlock === true ? 'txLocked' : 'txLock')}
                      </a>
                    </p>
                  )}
              </div>
            </div>
            <div className="flex-sb" style={{ alignItems: 'flex-start' }}>
              <div style={{ margin: '0 50px 0 0' }}>
                <p className={tx.color}>
                  {new Intl.NumberFormat(this.gui.language, {
                    maximumFractionDigits: 6,
                    minimumFractionDigits: 6
                  }).format(tx.amount)}{' '}
                  XVC (
                  {new Intl.NumberFormat(this.gui.language, {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2
                  }).format(tx.amount * local * average)}{' '}
                  {this.gui.localCurrency})
                </p>
                {'fee' in tx === true && (
                  <p className="red">
                    {new Intl.NumberFormat(this.gui.language, {
                      maximumFractionDigits: 6,
                      minimumFractionDigits: 6
                    }).format(tx.fee)}{' '}
                    XVC
                  </p>
                )}
                <p className={tx.color}>{tx.confirmations}</p>
              </div>
              <div className="labelsContent" style={{ flex: 1 }}>
                {'to' in tx === true && (
                  <div className="flex">
                    <i className="material-icons md-16">perm_identity</i>
                    <p>{this.t('recipient')}</p>
                  </div>
                )}
                {'to' in tx === true && (
                  <p style={{ fontWeight: '500' }}>{tx.to}</p>
                )}
                {'comment' in tx === true && (
                  <div className="flex">
                    <i className="material-icons md-16">create</i>
                    <p>{this.t('comment')}</p>
                  </div>
                )}
                {'comment' in tx === true && (
                  <p style={{ textAlign: 'justify' }}>{tx.comment}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div
          className="flex-sb"
          style={{ alignItems: 'flex-start', margin: '30px 0 0 0' }}
        >
          <div style={{ flex: 1 }}>
            <TransactionIoList io={this.io.vin} type="vin" />
          </div>
          <div style={{ margin: 'auto 10px auto 10px' }}>
            <div style={{ margin: '29px 0 0 0' }}>
              <i className="material-icons md-18">forward</i>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <TransactionIoList io={this.io.vout} type="vout" />
          </div>
        </div>
      </div>
    )
  }
}

export default Transaction
