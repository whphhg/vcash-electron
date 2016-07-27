import { action, autorun, computed, observable } from 'mobx'
import { v4 } from 'node-uuid'
import rpc from '../utilities/rpc'

/** Required store instances. */
import addressBook from './addressBook'
import transaction from './transaction'

/** Send store class. */
class Send {
  @observable fromAccount
  @observable recipients
  @observable drawer
  @observable button
  @observable buttonPressed
  @observable errors

  /**
   * Prepare observable variables, add initial recipient and start verify autorun.
   * @constructor
   * @property {string} fromAccount - Account to be sent from.
   * @property {array} recipients - Contains recipient objects.
   * @property {boolean} drawer - Drawer open status.
   * @property {boolean} button - Button enabled status.
   * @property {boolean} buttonPressed - Button pressed status.
   * @property {object} errors - Error status.
   * @property {boolean} errors.amountBelowTxFee - One of the amounts is below tx fee.
   * @property {boolean} errors.duplicateAddress - Attempted entering a duplicate address.
   * @property {boolean} errors.invalidRecipient - One of addresses is not fully entered.
   * @property {boolean} errors.insufficientBalance - Account balance too low.
   * @property {boolean} errors.insufficientFunds - Account balance can't cover amount with fees.
   * @property {boolean} errors.nonStandardTxType - Non-standard tx type.
   */
  constructor() {
    this.fromAccount = 'Default'
    this.recipients = []
    this.drawer = false
    this.button = false
    this.buttonPressed = false
    this.errors = {
      amountBelowTxFee: false,
      duplicateAddress: false,
      invalidRecipient: false,
      insufficientBalance: false,
      insufficientFunds: false,
      nonStandardTxType: false
    }

    this.addRecipient()
    this.verify()
  }

  /**
   * Add new recipient.
   * @function addRecipient
   */
  @action addRecipient() {
    this.recipients.push({
      id: v4(),
      address: '',
      amount: '',
      validAddress: null
    })
  }

  /**
   * Remove recipient.
   * @function removeRecipient
   * @param {string} id - Id of recipient to remove.
   */
  @action removeRecipient(id) {
    this.recipients = this.recipients.filter((recipient) => {
      return recipient.id !== id
    })
  }

  /**
   * Set recipient data.
   * @function setRecipient
   * @param {string} id - Id of recipient to edit.
   * @param {object} data - Data to update the recipient with.
   */
  @action setRecipient(id, data) {
    this.recipients = this.recipients.map((recipient) => {
      if (recipient.id === id) {
        recipient = {
          ...recipient,
          ...data
        }
      }

      return recipient
    })
  }

  /**
   * Set account to send from.
   * @function setAccount
   * @param {string} account - Account to send from.
   */
  @action setAccount(account) {
    this.fromAccount = account
  }

  /**
   * Set recipient address.
   * @function setAddress
   * @param {string} id - Id of recipient to set.
   * @param {string} address - New address.
   */
  @action setAddress(id, address) {
    if (address.match(/^[a-zA-Z0-9]{0,34}$/)) {
      /** Check if address is already entered. */
      if (address.length === 34) {
        for (let i = 0; i < this.recipients.length; i++) {
          if (this.recipients[i].id !== id) {
            if (this.recipients[i].address === address) {
              return this.setError('duplicateAddress')
            }
          }
        }
      }

      /** Validate address when it reaches 34 characters. */
      if (address.length === 34) {
        rpc({ method: 'validateaddress', params: [address] }, (response) => {
          if (response !== null) {
            this.setRecipient(id, {
              address,
              validAddress: response.result.isvalid
            })
          }
        })
      } else {
        this.setRecipient(id, {
          address,
          validAddress: null
        })
      }
    }
  }

  /**
   * Set recipient amount.
   * @function setAmount
   * @param {string} id - Id of recipient to set.
   * @param {string} amount - New amount.
   */
  @action setAmount(id, amount) {
    /** Reset amount when removing last number from the input field. */
    if (amount.length === 0) {
      return this.setRecipient(id, { amount: '' })
    }

    /** Add leading zero if only delimiter is entered. */
    switch (amount) {
      case '.':
        return this.setRecipient(id, { amount: '0.' })

      case ',':
        return this.setRecipient(id, { amount: '0,' })
    }

    /** Check if amount is in 0000000[.,]000000 format. */
    if (amount.match(/^\d{0,7}(?:\.\d{0,6})?$/) || amount.match(/^\d{0,7}(?:,\d{0,6})?$/)) {
      /** Check if amount is below tx fee. */
      if (parseFloat(amount) > 0 && parseFloat(amount) < 0.0005) {
        return
      }

      this.setRecipient(id, { amount })
    }
  }

  /**
   * Set error and button.
   * @function setError
   * @param {string} error - Error key to toggle on.
   */
  @action setError(error) {
    let button = true

    for (let i in this.errors) {
      if (error === i) {
        this.errors[i] = true
        button = false
      } else {
        this.errors[i] = false
      }
    }

    this.button = button
  }

  /**
   * Toggle button pressed.
   * @function toggleButton
   */
  @action toggleButton() {
    this.buttonPressed = !this.buttonPressed
  }

  /**
   * Toggle drawer.
   * @function toggleDrawer
   */
  @action toggleDrawer() {
    this.drawer = !this.drawer
  }

  /**
   * Get the total amount being sent.
   * @function total
   * @return {number} Total amount being sent.
   */
  @computed get total() {
    return this.recipients.reduce((total, recipient) => {
      return total += recipient.amount * 1000000
    }, 0) / 1000000
  }

  /**
   * Verify recipients every time they get updated.
   * @function verify
   */
  verify() {
    autorun(() => {
      let recipients = this.recipients.toJS()

      for (let i in recipients) {
        /** Check if address is valid and entered. */
        if (recipients[i].validAddress === false || recipients[i].validAddress === null) {
          return this.setError('invalidRecipient')
        }

        /** Check if amounts are entered and above tx fee. */
        if (parseFloat(recipients[i].amount) < 0.0005 || recipients[i].amount.length === 0) {
          return this.setError('amountBelowTxFee')
        }

      }

      /** Check if account balance can cover total. */
      if ((addressBook.byAccount[this.fromAccount].balance - this.total) < 0) {
        return this.setError('insufficientBalance')
      } else {
        if (this.errors.insufficientBalance) {
          return this.setError('')
        }
      }

      return this.setError('')
    })
  }

  /**
   * Sending confirmed, use sendtoaddress / sendmany accordingly.
   * @function confirm
   */
  confirm() {
    if (this.fromAccount === '#All') {
      rpc({ method: 'sendtoaddress', params: [this.recipients[0].address, this.recipients[0].amount] }, (response) => {
        if (response !== null) {
          this.toggleButton()

          if (response.hasOwnProperty('result')) {
            /** Set transaction id to current transaction and toggle dialog. */
            transaction.setTxid(response.result)
            transaction.toggleDialog()
          }

          if (response.hasOwnProperty('error')) {
            /** error_code_wallet_insufficient_funds (-4), insufficient funds. */
            switch (response.error.code) {
              case -4:
                return this.setError('insufficientFunds')
            }
          }
        }
      })
    } else {
      const recipientsAsParams = this.recipients.reduce((recipients, recipient) => {
        recipients[recipient.address] = recipient.amount
        return recipients
      }, {})

      rpc({ method: 'sendmany', params: [this.fromAccount === 'Default' ? '' : this.fromAccount, recipientsAsParams] }, (response) => {
        if (response !== null) {
          this.toggleButton()

          if (response.hasOwnProperty('result')) {
            /** Set transaction id to current transaction and toggle dialog. */
            transaction.setTxid(response.result)
            transaction.toggleDialog()
          }

          if (response.hasOwnProperty('error')) {
            /**
             * error_code (-4), nonstandard transaction type.
             * error_code_wallet_insufficient_funds (-6), insufficient funds.
             */
            switch (response.error.code) {
              case -4:
                return this.setError('nonStandardTxType')

              case -6:
                return this.setError('insufficientFunds')
            }
          }
        }
      })
    }
  }
}

const send = new Send()

export default send
export { Send }
