import { action, observable } from 'mobx'
import rpc from '../utilities/rpc'

/** Required store instances. */
import daemon from './daemon'
import wallet from './wallet'

/** ChainBlender store class. */
class ChainBlender {
  @observable blendstate
  @observable balance
  @observable denominatedbalance
  @observable nondenominatedbalance
  @observable blendedbalance
  @observable blendedpercentage
  @observable isActivated

  /**
   * Prepare observable variables and run RPC list function.
   * @constructor
   * @property {string} blendstate - Blending state (active/none).
   * @property {number} balance - Wallet balance.
   * @property {number} denominatedbalance - Denominated balance.
   * @property {number} nondenominatedbalance - Nondenominated balance.
   * @property {number} blendedbalance - Blended balance.
   * @property {number} blendedpercentage - Percent of wallet balance blended.
   * @property {boolean} isActivated - Is ChainBlender activated or not.
   */
  constructor() {
    this.blendstate = 'none'
    this.balance = 0
    this.denominatedbalance = 0
    this.nondenominatedbalance = 0
    this.blendedbalance = 0
    this.blendedpercentage = 0
    this.isActivated = false

    this.info()
  }

  /**
   * Set ChainBlender info.
   * @function setInfo
   * @param {object} info - New ChainBlender info.
   */
  @action setInfo(info) {
    for (let i in info) {
      if (this.hasOwnProperty(i)) {
        if (this[i] !== info[i]) {
          this[i] = info[i]
        }
      }
    }

    if (info.blendstate === 'active' && this.isActivated === false) {
      this.setIsActivated(true)
    }
  }

  /**
   * Set ChainBlender status.
   * @function setIsActivated
   * @param {boolean} isActivated - ChainBlender activated/not.
   */
  @action setIsActivated(isActivated) {
    this.isActivated = isActivated
  }

  /**
   * Get ChainBlender info.
   * @function info
   */
  info() {
    if (wallet.isLocked === false || daemon.isRunning === null) {
      rpc({ method: 'chainblender', params: ['info'] }, (response) => {
        if (response !== null) {
          if (response.hasOwnProperty('result')) {
            this.setInfo(response.result)
          }
        }
      })
    }

    setTimeout(() => { this.info() }, 10 * 1000)
  }

  /**
   * Toggle ChainBlender.
   * @function toggle
   */
  toggle() {
    rpc({ method: 'chainblender', params: [this.isActivated ? 'stop' : 'start'] }, (response) => {
      if (response !== null) {
        this.setIsActivated(!this.isActivated)
      }
    })
  }
}

const chainBlender = new ChainBlender()

export default chainBlender
export { ChainBlender }
