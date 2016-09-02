import { action, computed, observable } from 'mobx'
import rpc from '../utilities/rpc'

/** Transaction store class. */
class Transaction {
  @observable txid
  @observable data
  @observable dialog

  /**
   * Prepare observable variables.
   * @constructor
   * @property {string} txid - Txid to lookup.
   * @property {object} data - Transaction lookup response.
   * @property {boolean} dialog - Dialog status.
   */
  constructor() {
    this.txid = ''
    this.data = {}
    this.dialog = false
    this.timer = 0
  }

  /**
   * Set txid.
   * @function setTxid
   * @param {string} txid - Txid to lookup.
   */
  @action setTxid(txid) {
    this.txid = txid
    this.lookup()
  }

  /**
   * Set lookup response.
   * @function setData
   * @param {string} data - Transaction lookup response.
   * @param {number} timer - Update timer id.
   */
  @action setData(data, timer) {
    this.data = data
    this.timer = timer
  }

  /**
   * Toggle dialog.
   * @function toggleDialog
   */
  @action toggleDialog() {
    this.dialog = !this.dialog

    if (!this.dialog) {
      clearTimeout(this.timer)
    }
  }

  /**
   * Lookup transaction.
   * FIXME: Transaction dialog not complete, needs overhaul, fails opening if PoS.
   * @function lookup
   */
  lookup() {
    rpc({ method: 'gettransaction', params: [this.txid] }, (response) => {
      if (response !== null) {
        let options = []

        response.result.vin.forEach((input) => {
          options.push({
            method: 'gettransaction',
            params: [input.txid]
          })

          process.env.NODE_ENV === 'dev' && console.log(input.txid, input.vout)
        })

        rpc(options, (lookups) => {
          if (lookups !== null) {
            /** Go through each input and get its address and amount. */
            for (let i = 0; i < response.result.vin.length; i++) {
              response.result.vin[i].details = {
                address: lookups[i].result.vout[response.result.vin[i].vout].scriptPubKey.addresses[0],
                amount: lookups[i].result.vout[response.result.vin[i].vout].value,
              }
            }

            /** Go through each output and check if it's remainder. */
            response.result.vout.forEach((output) => {
              output.isRemainder = true

              if (response.result.hasOwnProperty('details')) {
                response.result.details.forEach((detail) => {
                  if (output.scriptPubKey.addresses[0] === detail.address) {
                    output.isRemainder = false
                  }
                })
              }
            })

            const timer = setTimeout(() => { this.lookup() }, 30 * 1000)
            this.setData(response.result, timer)
          }
        })
      } else {
        process.env.NODE_ENV === 'dev' && console.warn('RPC: Attempted updating transaction info, next in 10s.')
        setTimeout(() => { this.lookup() }, 10 * 1000)
      }
    })
  }
}

const transaction = new Transaction()

export default transaction
export { Transaction }
