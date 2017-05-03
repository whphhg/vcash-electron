import { action, autorun, computed, observable } from 'mobx'
import { decimalSeparator, shortUid } from '../utilities/common'
import { notification } from 'antd'
import i18next from '../utilities/i18next'

export default class Send {
  /**
   * Observable properties.
   * @property {boolean} blendedOnly - Use blended outputs only.
   * @property {string} comment - Comment about transaction.
   * @property {string} commentTo - Comment about recipient.
   * @property {string|null} fromAccount - Spend from this account.
   * @property {number} minConf - Minimum number of confirmations.
   * @property {array} recipients - Addresses and amounts to pay.
   * @property {boolean} zeroTime - Use ZeroTime.
   */
  @observable blendedOnly = false
  @observable comment = ''
  @observable commentTo = ''
  @observable fromAccount = null
  @observable minConf = 1
  @observable recipients = observable.map({})
  @observable zeroTime = false

  /**
   * @constructor
   * @param {object} info - Info store.
   * @param {object} rpc - RPC store.
   * @param {object} wallet - Wallet store.
   */
  constructor (info, rpc, wallet) {
    this.info = info
    this.rpc = rpc
    this.wallet = wallet

    /** Always have one recipient available. */
    autorun(() => {
      if (this.recipients.size === 0) this.addRecipient()
    })
  }

  /**
   * Get error status.
   * @function errorStatus
   * @return {string|boolean} Current error or false if none.
   */
  @computed get errorStatus () {
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
  @computed get total () {
    return this.recipients.values().reduce((total, recipient) => {
      return total + (recipient.amount * 1000000)
    }, 0) / 1000000
  }

  /**
   * Add new recipient.
   * @function addRecipient
   */
  @action addRecipient () {
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
  @action clear () {
    this.setAccount()
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
  @action removeRecipient (uid) {
    this.recipients.delete(uid)
  }

  /**
   * Set the name of the account from which the coins should be spent.
   * @function setAccount
   * @param {string} account - Account name.
   */
  @action setAccount (account = null) {
    this.fromAccount = account
  }

  /**
   * Set blended only flag.
   * @function setBlendedOnly
   * @param {boolean} blendedOnly - Blended only.
   */
  @action setBlendedOnly (blendedOnly = false) {
    this.blendedOnly = blendedOnly
  }

  /**
   * Set a locally-stored (not broadcast) comment assigned to this transaction.
   * @function setComment
   * @param {string} comment - Comment assigned to this transaction.
   */
  @action setComment (comment = '') {
    this.comment = comment
  }

  /**
   * Set a locally-stored (not broadcast) comment describing the recipient.
   * @function setCommentTo
   * @param {string} commentTo - Comment describing the recipient.
   */
  @action setCommentTo (commentTo = '') {
    this.commentTo = commentTo
  }

  /**
   * Set the minimum number of confirmations a transaction must have
   * for its outputs to be credited to the fromAccount’s balance.
   * @function setMinConf
   * @param {string} confirmations - Minimum confirmations.
   */
  @action setMinConf (confirmations = '1') {
    if (confirmations.match(/^[0-9]{0,6}$/) !== null) {
      /** Allow emptying input. */
      if (confirmations !== '') {
        confirmations = parseInt(confirmations)

        if (confirmations > this.info.wallet.blocks) return
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
  @action setRecipient (uid, name, value) {
    let saved = this.recipients.has(uid) === true
      ? this.recipients.get(uid)
      : false

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
      const difference = saved.amount === ''
        ? 0 - parseFloat(value)
        : parseFloat(saved.amount) - parseFloat(value)

      if (this.total - difference > this.info.wallet.balance) return

      /** Set ammount that passed above checks. */
      saved.amount = value
    }

    /** Address checks. */
    if (name === 'address') {
      /** Allow only alphanumerals. */
      if (value.match(/^[a-zA-Z0-9]{0,34}$/) === null) return

      /** Check if the address is a duplicate. */
      const duplicate = this.recipients.values().some((recipient) => {
        if (recipient.address !== '') {
          return recipient.address === value
        }
      })

      /** Do not allow entering duplicate addresses. */
      if (duplicate === true) return

      /** Set address. */
      saved.address = value

      /** Validate address when it reaches 34 characters. */
      if (value.length === 34) {
        this.rpc.execute([
          { method: 'validateaddress', params: [value] }
        ],
          action('Validate recipient', (response) => {
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
  @action setZeroTime (zeroTime = false) {
    this.zeroTime = zeroTime
  }

  /**
   * Confirm sending.
   * @function confirm
   */
  confirm () {
    /** Determine which sending method to use. */
    if (this.recipients.size === 1) {
      if (this.fromAccount === null) {
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

    this.rpc.execute([
      {
        method: 'sendtoaddress',
        params: [
          recipient[0].address,
          recipient[0].amount,
          this.comment,
          this.commentTo
        ]
      }
    ], (response) => {
      /** Sending succeded. */
      if (response[0].hasOwnProperty('result') === true) {
        /** Clear sending form. */
        this.clear()

        /** Open transaction details. */
        this.wallet.setViewing(response[0].result)
      }

      /** Sending failed. */
      if (response[0].hasOwnProperty('error') === true) {
        /** In case of an unknown error, print details to assist fixing. */
        console.error('Failed sending using sendtoaddress', response[0])

        switch (response[0].error.code) {
          /** Insufficient funds, error_code_wallet_insufficient_funds = -4. */
          case -4:
            return this.failed('insufficientFunds')
        }
      }
    })
  }

  /**
   * Send using sendfrom RPC.
   * @function sendfrom
   */
  sendfrom () {
    /** Get the recipient data. */
    const recipient = this.recipients.values()

    this.rpc.execute([
      {
        method: 'sendfrom',
        params: [
          this.fromAccount === '*' ? '' : this.fromAccount,
          recipient[0].address,
          recipient[0].amount,
          this.minConf,
          this.comment,
          this.commentTo
        ]
      }
    ], (response) => {
      /** Sending succeded. */
      if (response[0].hasOwnProperty('result') === true) {
        /** Clear sending form. */
        this.clear()

        /** Open transaction details. */
        this.wallet.setViewing(response[0].result)
      }

      /** Sending failed. */
      if (response[0].hasOwnProperty('error') === true) {
        /** In case of an unknown error, print details to assist fixing. */
        console.error('Failed sending using sendfrom', response[0])

        switch (response[0].error.code) {
          /** Insufficient funds, error_code_wallet_insufficient_funds = -6. */
          case -6:
            return this.failed('insufficientFunds')
        }
      }
    })
  }

  /**
   * Send using sendmany RPC.
   * @function sendmany
   */
  sendmany () {
    /** Get recipients data. */
    const recipients = this.recipients.values().reduce((recipients, recipient) => {
      recipients[recipient.address] = recipient.amount
      return recipients
    }, {})

    this.rpc.execute([
      {
        method: 'sendmany',
        params: [
          this.fromAccount === '*' ? '' : this.fromAccount,
          recipients,
          this.minConf,
          this.comment
        ]
      }
    ], (response) => {
      /** Sending succeded. */
      if (response[0].hasOwnProperty('result') === true) {
        /** Clear sending form. */
        this.clear()

        /** Open transaction details. */
        this.wallet.setViewing(response[0].result)
      }

      /** Sending failed. */
      if (response[0].hasOwnProperty('error') === true) {
        /** In case of an unknown error, print details to assist fixing. */
        console.error('Failed sending using sendmany', response[0])

        switch (response[0].error.code) {
          /** Nonstandard transaction type, error_code = -4. */
          case -4:
            return this.failed('transactionNotStandard')

          /** Insufficient funds, error_code_wallet_insufficient_funds = -6. */
          case -6:
            return this.failed('insufficientFunds')
        }
      }
    })
  }
}
