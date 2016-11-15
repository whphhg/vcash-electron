import { action, autorun, observable } from 'mobx'
import { notification } from 'antd'

/** Required store instances. */
import rpc from './rpc'
import wallet from './wallet'

/** ChainBlender store class. */
class ChainBlender {
  @observable info
  @observable status

  /**
   * @constructor
   * @property {object} info - chainblender info RPC response.
   * @property {boolean} status - ChainBlender status.
   */
  constructor() {
    this.info = {
      blendstate: 'none',
      balance: 0,
      denominatedbalance: 0,
      nondenominatedbalance: 0,
      blendedbalance: 0,
      blendedpercentage: 0 }
    this.status = false

    /** Auto start updating when the wallet unlocks. */
    autorun(() => { if (wallet.isLocked === false) this.getinfo() })
  }

  /**
   * Set RPC response.
   * @function setResponse
   * @param {object} response - RPC response object.
   */
  @action setResponse(response) {
    for (let i in response) {
      if (this.info.hasOwnProperty(i) === true) {
        if (this.info[i] !== response[i]) this.info[i] = response[i]
      }
    }

    /** Correct status if the daemon is already blending prior to you connecting. */
    if (response.blendstate === 'active' || response.blendstate === 'passive') {
      if (this.status === false) this.setStatus(true)
    }
  }

  /**
   * Set status.
   * @function setStatus
   * @param {boolean} status - ChainBlender status.
   */
  @action setStatus(status) { this.status = status }

  /**
   * Get ChainBlender info.
   * @function getinfo
   */
  getinfo() {
    rpc.call([{ method: 'chainblender', params: ['info'] }], (response) => {
      if (response !== null) {
        if (response[0].hasOwnProperty('result') === true) {
          this.setResponse(response[0].result)

          /** Loop every 10 seconds if the wallet is unlocked, else stop. */
          setTimeout(() => { this.getinfo() }, 10 * 1000)
        }
      }
    })
  }

  /**
   * Toggle ChainBlender.
   * @function toggle
   */
  toggle() {
    rpc.call([{ method: 'chainblender', params: [this.status === true ? 'stop' : 'start'] }], (response) => {
      if (response !== null) {
        this.setStatus(!this.status)

        const suffix = this.status === true ? 'started.' : 'stopped.'
        notification.success({
          message: 'ChainBlender',
          description: 'ChainBlender has been ' + suffix,
          duration: 6
        })
      }
    })
  }
}

/** Initialize a new globally used store. */
const chainBlender = new ChainBlender()

/** Export both, initialized store as default export, and store class as named export. */
export default chainBlender
export { ChainBlender }
