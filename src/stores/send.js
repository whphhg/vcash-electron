import { action, computed, extendObservable, reaction, runInAction } from 'mobx'
import { decimalSep, shortUid, statusColor } from '../utilities/common.js'
import { coin } from '../utilities/constants.js'
import message from 'antd/lib/message'
import notification from 'antd/lib/notification'
import i18next from '../utilities/i18next.js'

/**
 * TODO: Enforce account balances after the two issues below are fixed.
 *       - https://github.com/openvcash/vcash/issues/7
 *       - https://github.com/openvcash/vcash/issues/11
 */
class Send {
  /**
   * @param {object} gui - Global GUI store.
   * @param {object} rpc - Connection instance RPC store.
   * @param {object} wallet - Connection instance Wallet store.
   * @prop {string} comment - Comment about transaction.
   * @prop {string} commentTo - Comment about recipient.
   * @prop {number} minConf - Minimum number of confirmations.
   * @prop {object} spend - Spend funds from this account or utxo set.
   * @prop {map} recipients - Addresses and amounts to pay.
   */
  constructor(gui, rpc, wallet) {
    this.gui = gui
    this.rpc = rpc
    this.wallet = wallet

    /** Extend the store with observable properties. */
    extendObservable(this, {
      comment: '',
      commentTo: '',
      minConf: 1,
      spend: { fromAccount: '*ANY*', utxo: [] },
      recipients: new Map()
    })

    /** Always have one recipient available. */
    reaction(
      () => this.recipientsKeys.length,
      recipients => {
        if (recipients === 0) this.addRecipient()
      },
      {
        fireImmediately: true,
        name: 'Send: checking if at least one recipient is available.'
      }
    )

    /**
     * Change to the *DEFAULT* account if spending from *ANY*, with multiple
     * recipients and removing the last unspent transaction output.
     */
    reaction(
      () => this.spend.utxo.length,
      selected => {
        if (selected !== 0) return
        if (this.spend.fromAccount !== '*ANY*') return
        if (this.recipients.size === 1) return

        /** Change to the default account and inform the user. */
        this.setSpendFrom('*DEFAULT*')
        message.success(i18next.t('accChanged'))
      },
      { name: 'Send: checking if the last selected utxo was removed.' }
    )
  }

  /**
   * Get viewing address outputs with current confirmation counts.
   * @function addrOutputs
   * @return {array} Viewing address outputs.
   */
  @computed
  get addrOutputs() {
    const addr = this.wallet.addr.get(this.wallet.viewing.addr)

    return addr.outputs.reduce((outputs, output) => {
      const tx = this.wallet.tx.get(output.txid)
      const txidVout = output.txid + ':' + output.vout
      const utxoIndex = this.wallet.utxoKeys.indexOf(txidVout)

      outputs.push({
        ...output,
        checked: this.spend.utxo.includes(txidVout) === true,
        color: statusColor(
          utxoIndex === -1
            ? tx.confirmations
            : this.wallet.utxo[utxoIndex].confirmations,
          tx.category
        )
      })

      return outputs
    }, [])
  }

  /**
   * Get present error or empty string if none.
   * @function errorStatus
   * @return {string} Error status.
   */
  @computed
  get errorStatus() {
    if (this.minConf === '') return 'noMinConf'

    /** TODO: Remove temporary error once SignRawTransaction is added. */
    if (this.spend.utxo.length > 0) return 'noSignRawTransactionRPC'

    /** Check if recipients addresses are valid and amounts above tx fee. */
    const recipients = this.recipients.values()

    for (let i = 0; i < recipients.length; i++) {
      if (recipients[i].addressValid !== true) return 'addrInvalid'
      if (recipients[i].amount < this.wallet.info.paytxfee) return 'belowTxFee'
    }

    return ''
  }

  /**
   * Get recipients in format for RPC use.
   * @function recipientList
   * @return {object} Recipient list for RPC use.
   */
  @computed
  get recipientList() {
    return this.recipients.values().reduce((recipients, recipient) => {
      recipients[recipient.address] = recipient.amount
      return recipients
    }, {})
  }

  /**
   * Get recipients keys.
   * @function recipientsKeys
   * @return {array} Recipients keys.
   */
  @computed
  get recipientsKeys() {
    return [...this.recipients.keys()]
  }

  /**
   * Get spendable balance: wallet or selected account, or sum of selected utxo.
   * @function spendBalance
   * @return {number} Spendable balance.
   */
  @computed
  get spendBalance() {
    /** Return wallet or account balance. */
    if (this.spend.utxo.length === 0) {
      const acc = this.spend.fromAccount

      if (acc === '*ANY*') return this.wallet.info.balance
      if (acc === '*DEFAULT*') return this.wallet.acc.get('').balance
      return this.wallet.acc.get(acc).balance
    }

    /** Return the sum of outputs selected for spending. */
    return (
      this.spendUtxo.reduce((total, utxo) => {
        return total + utxo.amount * coin
      }, 0) / coin
    )
  }

  /**
   * Get unspent transaction outputs marked for spending.
   * @function spendUtxo
   * @return {array} Outputs marked for spending.
   */
  @computed
  get spendUtxo() {
    return this.spend.utxo.reduce((spendUtxo, utxo) => {
      spendUtxo.push(this.wallet.utxo[this.wallet.utxoKeys.indexOf(utxo)])
      return spendUtxo
    }, [])
  }

  /**
   * Get the total amount to send.
   * @function total
   * @return {number} Total amount.
   */
  @computed
  get total() {
    return (
      this.recipients.values().reduce((total, recipient) => {
        return total + recipient.amount * coin
      }, 0) / coin
    )
  }

  /**
   * Add new recipient.
   * @function addRecipient
   */
  @action
  addRecipient() {
    const id = shortUid()

    this.recipients.set(id, {
      id,
      address: '',
      addressValid: null,
      amount: 0,
      amountString: ''
    })
  }

  /**
   * Remove recipient.
   * @function removeRecipient
   * @param {string} id - Recipient ID.
   */
  @action
  removeRecipient(id) {
    this.recipients.delete(id)
  }

  /**
   * Reset everything to default state.
   * @function reset
   */
  @action
  reset() {
    this.setComment()
    this.setCommentTo()
    this.setMinConf()
    this.setSpendFrom()
    this.recipients.clear()
    this.spend.utxo = []
  }

  /**
   * Update recipient address.
   * @function setAddress
   * @param {string} id - Recipient ID.
   * @param {string} address - Entered address.
   */
  @action
  async setAddress(id, address) {
    const recipient = this.recipients.get(id)

    /** Allow only alphanumerals with max 34 characters in length. */
    if (address.match(/^[a-zA-Z0-9]{0,34}$/) === null) return

    /** Do not allow entering duplicate addresses. */
    const recipients = this.recipients.values()

    for (let i = 0; i < recipients.length; i++) {
      if (recipients[i].address === address) return
    }

    /** Set address that passed above checks. */
    recipient.address = address

    /** Validate the address when it reaches 34 characters. */
    if (address.length === 34) {
      const res = await this.rpc.validateAddress(address)

      runInAction(() => {
        recipient.addressValid = res.result.isvalid
      })
    } else {
      recipient.addressValid = null
    }
  }

  /**
   * Update recipient amount.
   * @function setAmount
   * @param {string} id - Recipient ID.
   * @param {string} amountString - Entered amount.
   */
  @action
  setAmount(id, amountString) {
    const recipient = this.recipients.get(id)

    /** Set amount to 0 when removing the last number from the input field. */
    if (amountString.length === 0) {
      recipient.amount = 0
      recipient.amountString = ''
      return
    }

    /** Add leading zero if only the decimal separator is entered. */
    if (amountString === decimalSep()) {
      recipient.amount = 0
      recipient.amountString = '0' + decimalSep()
      return
    }

    /** Check if amount is in 0000000[.,]000000 format. */
    switch (decimalSep()) {
      case '.':
        if (amountString.match(/^\d{0,7}(?:\.\d{0,6})?$/) === null) return
        break

      case ',':
        if (amountString.match(/^\d{0,7}(?:,\d{0,6})?$/) === null) return
        break
    }

    /** Do not allow amounts below tx fee. */
    const amount = parseFloat(amountString)
    if (amount > 0 && amount < this.wallet.info.paytxfee) return

    /** Do not allow amounts bringing total over wallet balance. */
    const difference = recipient.amount - amount
    if (this.total - difference > this.wallet.info.balance) return

    /** Set ammount that passed above checks. */
    recipient.amount = amount
    recipient.amountString = amountString
  }

  /**
   * Set a locally-stored (not broadcast) comment assigned to this transaction.
   * @function setComment
   * @param {string} comment - Comment assigned to this transaction.
   */
  @action
  setComment(comment = '') {
    this.comment = comment
  }

  /**
   * Set a locally-stored (not broadcast) comment describing the recipient.
   * @function setCommentTo
   * @param {string} commentTo - Comment describing the recipient.
   */
  @action
  setCommentTo(commentTo = '') {
    this.commentTo = commentTo
  }

  /**
   * Set the minimum number of confirmations a transaction must have
   * for its outputs to be credited to this.spend.fromAccount balance.
   * @function setMinConf
   * @param {string} confirmations - Minimum confirmations.
   */
  @action
  setMinConf(confirmations = '1') {
    if (confirmations.match(/^[0-9]{0,6}$/) !== null) {
      /** Allow emptying input field. */
      if (confirmations !== '') {
        confirmations = parseInt(confirmations)

        if (confirmations > this.wallet.info.blocks) return
        if (confirmations < 1) return
      }

      this.minConf = confirmations
    }
  }

  /**
   * Toggle output for spending.
   * @function setOutput
   * @param {string} txidVout - Output in txid:vout format.
   */
  @action
  setOutput(txidVout) {
    if (this.spend.utxo.includes(txidVout) === false) {
      this.spend.utxo.push(txidVout)
    } else {
      const index = this.spend.utxo.indexOf(txidVout)
      if (index !== -1) this.spend.utxo.splice(index, 1)
    }
  }

  /**
   * Set recipient address or amount.
   * @function setRecipient
   * @param {string} id - Recipient ID.
   * @param {string} name - Input field name.
   * @param {string} value - Entered value.
   */
  setRecipient(id, name, value) {
    if (name === 'address') return this.setAddress(id, value)
    if (name === 'amount') return this.setAmount(id, value)
  }

  /**
   * Set the account from which the coins will be spent.
   * @function setSpendFrom
   * @param {string} account - Account name.
   */
  @action
  setSpendFrom(account = '*ANY*') {
    this.spend.fromAccount = account
  }

  /**
   * Confirm sending and use the correct sending RPC.
   * @function confirm
   */
  confirm() {
    if (this.spend.utxo.length > 0) return this.sendRawTransaction()
    if (this.recipients.size > 1) return this.sendMany()
    if (this.spend.fromAccount === '*ANY*') return this.sendToAddress()
    return this.sendFrom()
  }

  /**
   * Open failed notification.
   * @function failed
   * @param {string} type - Error type.
   */
  failed(type) {
    notification.error({
      message: i18next.t('sendingFailed'),
      description: i18next.t(type),
      duration: 0
    })
  }

  /**
   * Update the wallet and set viewing the sent transaction.
   * @function succeeded
   * @param {string} txid - Sent transaction ID.
   */
  succeeded(txid) {
    notification.success({
      message: i18next.t('sent'),
      description: ''.concat(
        new Intl.NumberFormat(this.gui.language, {
          minimumFractionDigits: 6,
          maximumFractionDigits: 6
        }).format(this.total),
        ' XVC'
      )
    })

    /** Update balance (and unconfirmed) info, triggering wallet update. */
    this.wallet.updateInfo('wallet')

    /** Update viewing transaction and reset the sending form. */
    this.wallet.setViewing('tx', txid)
    this.reset()
  }

  /**
   * Send using sendFrom RPC.
   * @function sendFrom
   */
  async sendFrom() {
    const recipient = this.recipients.values()
    const res = await this.rpc.sendFrom(
      this.spend.fromAccount === '*DEFAULT*' ? '' : this.spend.fromAccount,
      recipient[0].address,
      recipient[0].amount,
      this.minConf,
      this.comment,
      this.commentTo
    )

    if ('result' in res === true) return this.succeeded(res.result)
    if ('error' in res === true) {
      console.error('Failed sending using sendFrom', res)

      switch (res.error.code) {
        case -6:
          return this.failed('insufficientFunds')
      }
    }
  }

  /**
   * Send using sendMany RPC.
   * @function sendMany
   */
  async sendMany() {
    const res = await this.rpc.sendMany(
      this.spend.fromAccount === '*DEFAULT*' ? '' : this.spend.fromAccount,
      this.recipientList,
      this.minConf,
      this.comment
    )

    if ('result' in res === true) return this.succeeded(res.result)
    if ('error' in res === true) {
      console.error('Failed sending using sendMany', res)

      switch (res.error.code) {
        case -4:
          return this.failed('txNotStandard')
        case -6:
          return this.failed('insufficientFunds')
      }
    }
  }

  /**
   * Send using sendRawTransaction RPC.
   * @function sendRawTransaction
   */
  async sendRawTransaction() {
    /** Unspent transaction outputs to be used as inputs. */
    const inputs = this.spendUtxo.reduce((list, utxo) => {
      list.push({ txid: utxo.txid, vout: utxo.vout })
      return list
    }, [])

    /** Create raw transaction. */
    const resCreate = await this.rpc.createRawTransaction(
      inputs,
      this.recipientList
    )

    if ('result' in resCreate === true) console.warn(resCreate)
    if ('error' in resCreate === true) console.error(resCreate)

    /**
     * TODO: Finish raw sending once SignRawTransaction RPC is added.
     *       - How to calculate the fee and return the rest to a change address?
     */
    // const resSign = await this.rpc.signRawTransaction(resCreate.result)
    // const resSend = await this.rpc.sendRawTransaction(resSign.result)
  }

  /**
   * Send using sendToAddress RPC.
   * @function sendToAddress
   */
  async sendToAddress() {
    const recipient = this.recipients.values()
    const res = await this.rpc.sendToAddress(
      recipient[0].address,
      recipient[0].amount,
      this.comment,
      this.commentTo
    )

    if ('result' in res === true) return this.succeeded(res.result)
    if ('error' in res === true) {
      console.error('Failed sending using sendToAddress', res)

      switch (res.error.code) {
        case -4:
          return this.failed('insufficientFunds')
      }
    }
  }
}

/** Export store class as default export. */
export default Send
