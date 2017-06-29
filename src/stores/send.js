import { action, autorun, computed, observable } from 'mobx'
import { decimalSeparator, shortUid } from '../utilities/common'
import { notification } from 'antd'
import i18next from '../utilities/i18next'

/**
 * NOTE: Enforce account balances after the two issues below are fixed.
 *       - https://github.com/openvcash/vcash/issues/7
 *       - https://github.com/openvcash/vcash/issues/11
 */
export default class Send {
  /**
   * Observable properties.
   * @property {boolean} blendedOnly - Use blended outputs only.
   * @property {string} comment - Comment about transaction.
   * @property {string} commentTo - Comment about recipient.
   * @property {number} minConf - Minimum number of confirmations.
   * @property {map} recipients - Addresses and amounts to pay.
   * @property {boolean} zeroTime - Use ZeroTime.
   */
  @observable blendedOnly = false
  @observable comment = ''
  @observable commentTo = ''
  @observable minConf = 1
  @observable recipients = observable.map({})
  @observable zeroTime = false

  /**
   * @constructor
   * @param {object} rpc - RPC store.
   * @param {object} wallet - Wallet store.
   */
  constructor (rpc, wallet) {
    this.rpc = rpc
    this.wallet = wallet

    /** Always have one recipient available. */
    autorun(() => {
      if (this.recipients.size === 0) {
        this.addRecipient()
      }
    })
  }

  /**
   * Get error status.
   * @function errorStatus
   * @return {string|boolean} Current error or false if none.
   */
  @computed
  get errorStatus () {
    if (this.minConf === '') return 'missingMinConf'

    /** Get recipients. */
    const recipients = this.recipients.values()

    /** Loop over recipients and make sure they are valid. */
    for (let i = 0; i < recipients.length; i++) {
      /** Check if addresses are valid and entered. */
      if (
        recipients[i].addressValid === false ||
        recipients[i].addressValid === null
      ) {
        return 'invalidRecipient'
      }

      /** Check if amounts are entered and above tx fee. */
      if (
        recipients[i].amount.length === 0 ||
        parseFloat(recipients[i].amount) < 0.0005
      ) {
        return 'amountBelowTxFee'
      }
    }

    return false
  }

  /**
   * Get the total amount to send.
   * @function total
   * @return {number} Total amount to send.
   */
  @computed
  get total () {
    return (
      this.recipients.values().reduce((total, recipient) => {
        return total + recipient.amount * 1000000
      }, 0) / 1000000
    )
  }

  /**
   * Add new recipient.
   * @function addRecipient
   */
  @action
  addRecipient () {
    const uid = shortUid()

    this.recipients.set(uid, {
      uid,
      addressValid: null,
      address: '',
      amount: ''
    })
  }

  /** Clear recipients and options.
   * @function clear
   */
  @action
  clear () {
    this.wallet.setSpendFrom()
    this.setComment()
    this.setCommentTo()
    this.setMinConf()
    this.recipients.clear()
  }

  /**
   * Remove recipient.
   * @function removeRecipient
   * @param {string} uid - Recipient uid.
   */
  @action
  removeRecipient (uid) {
    this.recipients.delete(uid)
  }

  /**
   * Set blended only flag.
   * @function setBlendedOnly
   * @param {boolean} blendedOnly - Blended only.
   */
  @action
  setBlendedOnly (blendedOnly = false) {
    this.blendedOnly = blendedOnly
  }

  /**
   * Set a locally-stored (not broadcast) comment assigned to this transaction.
   * @function setComment
   * @param {string} comment - Comment assigned to this transaction.
   */
  @action
  setComment (comment = '') {
    this.comment = comment
  }

  /**
   * Set a locally-stored (not broadcast) comment describing the recipient.
   * @function setCommentTo
   * @param {string} commentTo - Comment describing the recipient.
   */
  @action
  setCommentTo (commentTo = '') {
    this.commentTo = commentTo
  }

  /**
   * Set the minimum number of confirmations a transaction must have
   * for its outputs to be credited to the wallet.spendFrom balance.
   * @function setMinConf
   * @param {string} confirmations - Minimum confirmations.
   */
  @action
  setMinConf (confirmations = '1') {
    if (confirmations.match(/^[0-9]{0,6}$/) !== null) {
      /** Allow emptying input. */
      if (confirmations !== '') {
        confirmations = parseInt(confirmations)

        if (confirmations > this.wallet.info.getinfo.blocks) return
        if (confirmations < 1) return
      }

      this.minConf = confirmations
    }
  }

  /**
   * Set recipient's address or amount.
   * @function setRecipient
   * @param {string} uid - Recipient uid.
   * @param {string} name - Input field name.
   * @param {string} value - Entered value.
   */
  @action
  setRecipient (uid, name, value) {
    let saved =
      this.recipients.has(uid) === true ? this.recipients.get(uid) : false

    /** Exit in a "highly" unprobable situation of no recipient. */
    if (saved === false) return

    /** Amount checks. */
    if (name === 'amount') {
      /** Reset amount when removing last number from the input field. */
      if (value.length === 0) {
        saved.amount = ''
        return
      }

      /** Add leading zero if only decimal separator is entered. */
      if (value === decimalSeparator()) {
        saved.amount = '0' + decimalSeparator()
        return
      }

      /** Check if amount is in 0000000[.,]000000 format. */
      switch (decimalSeparator()) {
        case '.':
          if (value.match(/^\d{0,7}(?:\.\d{0,6})?$/) === null) return
          break

        case ',':
          if (value.match(/^\d{0,7}(?:,\d{0,6})?$/) === null) return
          break
      }

      /** Do not allow amounts below tx fee. */
      if (parseFloat(value) > 0 && parseFloat(value) < 0.0005) return

      /** Check if the new total amount is over wallet balance. */
      const difference =
        saved.amount === ''
          ? 0 - parseFloat(value)
          : parseFloat(saved.amount) - parseFloat(value)

      if (this.total - difference > this.wallet.info.getinfo.balance) return

      /** Set ammount that passed above checks. */
      saved.amount = value
    }

    /** Address checks. */
    if (name === 'address') {
      /** Allow only alphanumerals. */
      if (value.match(/^[a-zA-Z0-9]{0,34}$/) === null) return

      /** Check if the address is a duplicate. */
      const duplicate = this.recipients.values().some(recipient => {
        if (recipient.address !== '') return recipient.address === value
      })

      /** Do not allow entering duplicate addresses. */
      if (duplicate === true) return

      /** Set address. */
      saved.address = value

      /** Validate address when it reaches 34 characters. */
      if (value.length === 34) {
        this.rpc.execute(
          [{ method: 'validateaddress', params: [value] }],
          action('Validate recipient', response => {
            saved.addressValid = response[0].result.isvalid
          })
        )
      } else {
        saved.addressValid = null
      }
    }
  }

  /**
   * Set ZeroTime flag.
   * @function setZeroTime
   * @param {boolean} zeroTime - Use ZeroTime.
   */
  @action
  setZeroTime (zeroTime = false) {
    this.zeroTime = zeroTime
  }

  /**
   * Confirm sending.
   * @function confirm
   */
  confirm () {
    /** Determine which sending method to use. */
    if (this.recipients.size === 1) {
      if (this.wallet.spendFrom === '#') {
        this.sendtoaddress()
      } else {
        this.sendfrom()
      }
    } else {
      this.sendmany()
    }
  }

  /**
   * Open failed notification.
   * @function failed
   * @param {string} type - Error type.
   */
  failed (type) {
    notification.error({
      message: i18next.t('wallet:sendingFailed'),
      description: i18next.t('wallet:' + type),
      duration: 0
    })
  }

  /**
   * Send using sendtoaddress RPC.
   * @function sendtoaddress
   */
  sendtoaddress () {
    /** Get the recipient data. */
    const recipient = this.recipients.values()

    this.rpc.execute(
      [
        {
          method: 'sendtoaddress',
          params: [
            recipient[0].address,
            recipient[0].amount,
            this.comment,
            this.commentTo
          ]
        }
      ],
      response => {
        /** Clear sending form and open tx details. */
        if (response[0].hasOwnProperty('result') === true) {
          this.clear()
          this.wallet.setViewing(response[0].result)
        }

        /** Set error. */
        if (response[0].hasOwnProperty('error') === true) {
          console.error('Failed sending using sendtoaddress', response[0])

          switch (response[0].error.code) {
            /** error_code_wallet_insufficient_funds */
            case -4:
              return this.failed('insufficientFunds')
          }
        }
      }
    )
  }

  /**
   * Send using sendfrom RPC.
   * @function sendfrom
   */
  sendfrom () {
    /** Get the recipient data. */
    const recipient = this.recipients.values()

    this.rpc.execute(
      [
        {
          method: 'sendfrom',
          params: [
            this.wallet.spendFrom === '*' ? '' : this.wallet.spendFrom,
            recipient[0].address,
            recipient[0].amount,
            this.minConf,
            this.comment,
            this.commentTo
          ]
        }
      ],
      response => {
        /** Clear sending form and open tx details. */
        if (response[0].hasOwnProperty('result') === true) {
          this.clear()
          this.wallet.setViewing(response[0].result)
        }

        /** Set error. */
        if (response[0].hasOwnProperty('error') === true) {
          console.error('Failed sending using sendfrom', response[0])

          switch (response[0].error.code) {
            /** error_code_wallet_insufficient_funds */
            case -6:
              return this.failed('insufficientFunds')
          }
        }
      }
    )
  }

  /**
   * Send using sendmany RPC.
   * @function sendmany
   */
  sendmany () {
    /** Get recipients data. */
    const recipients = this.recipients.values().reduce((list, recipient) => {
      list[recipient.address] = recipient.amount
      return list
    }, {})

    this.rpc.execute(
      [
        {
          method: 'sendmany',
          params: [
            this.wallet.spendFrom === '*' ? '' : this.wallet.spendFrom,
            recipients,
            this.minConf,
            this.comment
          ]
        }
      ],
      response => {
        /** Clear sending form and open tx details. */
        if (response[0].hasOwnProperty('result') === true) {
          this.clear()
          this.wallet.setViewing(response[0].result)
        }

        /** Set error. */
        if (response[0].hasOwnProperty('error') === true) {
          console.error('Failed sending using sendmany', response[0])

          switch (response[0].error.code) {
            /** error_code (nonstandard transaction type) */
            case -4:
              return this.failed('transactionNotStandard')

            /** error_code_wallet_insufficient_funds */
            case -6:
              return this.failed('insufficientFunds')
          }
        }
      }
    )
  }
}
