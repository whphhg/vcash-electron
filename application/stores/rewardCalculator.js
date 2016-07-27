import { action, computed, observable } from 'mobx'
import { calculateIncentive, calculatePoW } from '../utilities/blockRewards'
import rpc from '../utilities/rpc'

/** Required store instances. */
import wallet from './wallet'

/** Block reward calculator store class. */
class RewardCalculator {
  @observable block
  @observable time
  @observable estimate
  @observable incentiveReward
  @observable powPercent
  @observable powReward

  /**
   * Prepare observable variables.
   * @constructor
   * @property {string} block - User entered block height.
   * @property {string} time - Date and time.
   * @property {boolean} estimate - Estimate or already mined / staked.
   * @property {number} incentiveReward - Incentive reward amount.
   * @property {number} powPercent - Miner share of PoW reward.
   * @property {number} powReward - PoW reward amount.
   */
  constructor() {
    this.block = ''
    this.time = new Date()
    this.estimate = false
    this.incentiveReward = 0
    this.powPercent = 0
    this.powReward = 0
  }

  /**
   * Set block height.
   * @function setBlock
   * @param {number} block - Block height.
   */
  @action setBlock(block) {
    /** Clear if text input is empty. */
    if (!block) {
      this.block = ''
    } else {
      if (block.toString().match(/^[0-9]{0,7}$/)) {
        this.block = block
        this.calculate()
      }
    }
  }
  /**
   * Set calculated data.
   * @function setData
   * @param {object} data - Calculated data.
   */
  @action setData(data) {
    this.time = data.time
    this.estimate = data.estimate
    this.incentiveReward = parseFloat(data.incentiveReward).toFixed(6)
    this.powPercent = data.powPercent
    this.powReward = parseFloat(data.powReward).toFixed(6)
  }

  /**
   * Get next 100k rewards data in 2.5k increments,
   * in a format that recharts can read.
   * @function chartData
   * @return {array} Chart data.
   */
  @computed get chartData() {
    const blockHeight = this.block === '' ? parseInt(wallet.blocks) : parseInt(this.block)
    let data = []

    for (let i = blockHeight; i <= blockHeight + 100000; i += 2500) {
      const powPercent = calculateIncentive(i)
      const powReward = calculatePoW(i)
      const incentiveReward = (powReward / 100) * powPercent

      data.push({
        block: i,
        'Incentive share': parseFloat(parseFloat(incentiveReward).toFixed(6)),
        'Miner share': parseFloat(parseFloat(powReward - incentiveReward).toFixed(6)),
        'PoW reward': parseFloat(parseFloat(powReward.toFixed(6)))
      })
    }

    return data
  }

  /**
   * Calculate block rewards.
   * @function calculate
   */
  calculate() {
    const powPercent = calculateIncentive(this.block)
    const powReward = calculatePoW(this.block)
    const incentiveReward = (powReward / 100) * powPercent

    if (this.block <= wallet.blocks) {
      rpc({ method: 'getblockhash', params: [this.block] }, (response) => {
        if (response !== null) {
          rpc({ method: 'getblock', params: [response.result] }, (response) => {
            if (response !== null) {
              this.setData({
                time: new Date(response.result.time * 1000),
                estimate: false,
                incentiveReward,
                powPercent,
                powReward
              })
            }
          })
        }
      })
    } else {
      /**
       * Variable block time targeting 80-200 seconds.
       * 200 - 80 = 120 / 2 = 60 + 80 = 140
       */
      let time = new Date()
      time.setSeconds(time.getSeconds() + (this.block - wallet.blocks) * 140)
      this.setData({
        time,
        estimate: true,
        incentiveReward,
        powPercent,
        powReward
      })
    }
  }
}

const rewardCalculator = new RewardCalculator()

export default rewardCalculator
export { RewardCalculator }
