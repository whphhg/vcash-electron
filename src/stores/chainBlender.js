import { action, autorun, observable } from 'mobx'
import { notification } from 'antd'
import i18next from '../utilities/i18next'

/** Required store instances. */
import rpc from './rpc'
import wallet from './wallet'

class ChainBlender {
  /**
   * Observable properties.
   * @property {boolean} status - ChainBlender status.
   * @property {object} info - chainblender info RPC response.
   */
  @observable status = false
  @observable info = {
    blendstate: 'none',
    balance: 0,
    denominatedbalance: 0,
    nondenominatedbalance: 0,
    blendedbalance: 0,
    blendedpercentage: 0
  }

  /**
   * @constructor
   * @property {number|null} loopTimeout - setTimeout id of this.getinfo().
   */
  constructor () {
    this.loopTimeout = null

    /** Start updating when the wallet gets unlocked. */
    autorun(() => {
      if (wallet.isLocked === false) {
        /** Clear previous this.getinfo() setTimeout. */
        if (this.loopTimeout !== null) this.clearLoopTimeout()

        /** Start update loop. */
        this.getinfo()
      }
    })
  }

  /**
   * Set RPC response.
   * @function setResponse
   * @param {object} info - chainblender info RPC response.
   */
  @action setResponse (info) {
    for (let i in info) {
      if (this.info[i] !== info[i]) {
        this.info[i] = info[i]
      }
    }

    /** Correct status if the daemon is already blending. */
    if (
      info.blendstate === 'active' ||
      info.blendstate === 'passive'
    ) {
      if (this.status === false) this.setStatus(true)
    }
  }

  /**
   * Set status.
   * @function setStatus
   * @param {boolean} status - ChainBlender status.
   */
  @action setStatus (status) {
    this.status = status
  }

  /**
   * Clear current loop timeout.
   * @function clearLoop
   */
  @action clearLoopTimeout () {
    clearTimeout(this.loopTimeout)
    this.loopTimeout = null
  }

  /**
   * Start new loop timeout and save its id.
   * @function setLoopTimeout
   */
  @action setLoopTimeout () {
    this.loopTimeout = setTimeout(() => {
      this.getinfo()
    }, 10 * 1000)
  }

  /**
   * Get ChainBlender info.
   * @function getinfo
   */
  getinfo () {
    rpc.call([
      {
        method: 'chainblender',
        params: ['info']
      }
    ], (response) => {
      if (response !== null) {
        if (response[0].hasOwnProperty('result') === true) {
          /** Start new loop. */
          this.setLoopTimeout()

          /** Set the response. */
          this.setResponse(response[0].result)
        }
      }
    })
  }

  /**
   * Toggle ChainBlender.
   * @function toggle
   */
  toggle () {
    rpc.call([
      {
        method: 'chainblender',
        params: [
          this.status === true
            ? 'stop'
            : 'start'
        ]
      }
    ], (response) => {
      if (response !== null) {
        /** Set the status. */
        this.setStatus(!this.status)

        /** Display notification. */
        notification.success({
          message: 'ChainBlender',
          description: i18next.t('wallet:chainBlender',
            {
              context: this.status === true
                ? 'start'
                : 'stop'
            }
          ),
          duration: 6
        })
      }
    })
  }
}

/** Initialize a new globally used store. */
const chainBlender = new ChainBlender()

/**
 * Export initialized store as default export,
 * and store class as named export.
 */
export default chainBlender
export { ChainBlender }
