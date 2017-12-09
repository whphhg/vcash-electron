import { action, computed, extendObservable, reaction } from 'mobx'
import { coin } from '../utilities/common'

class Statistics {
  /**
   * @param {object} rpc - Connection instance RPC store.
   * @param {object} wallet - Connection instance Wallet store.
   * @prop {number|null} updateTimeout - setNetworkByMinute timeout id.
   * @prop {array} networkByMinute - Hash rate and difficulty in 1min interval.
   */
  constructor(rpc, wallet) {
    this.rpc = rpc
    this.wallet = wallet
    this.updateTimeout = null

    /** Extend the store with observable properties. */
    extendObservable(this, { networkByMinute: [] })

    /** Start update loop or cleanup after RPC connectivity change. */
    reaction(
      () => this.rpc.ready,
      ready => {
        if (ready === true) {
          this.updateTimeout = setTimeout(
            () => this.setNetworkByMinute(),
            3 * 1000
          )
        }

        if (ready === false) {
          /** Clear auto-update timeout when RPC becomes unreachable. */
          clearTimeout(this.updateTimeout)
        }
      },
      { name: 'Statistics: RPC ready changed, adjusting update loops.' }
    )
  }

  /**
   * Get saved network statistics since GUI launch.
   * @function network
   * @return {array} Network statistics by minute.
   */
  @computed
  get network() {
    return this.networkByMinute.length > 1
      ? [...this.networkByMinute]
      : [...this.networkByMinute, ...this.networkByMinute]
  }

  /**
   * Get daily totals grouped by category for the last 31 days.
   * @function dailyTotals
   * @return {array} Daily totals by category.
   */
  @computed
  get dailyTotals() {
    /** Threshold for including transactions (today - 31 days). */
    const threshold = new Date().getTime() - 31 * 24 * 60 * 60 * 1000

    /** Populate the map with the last 31 dates. */
    let totals = new Map()

    for (let i = 1; i <= 31; i++) {
      const timestamp = threshold + i * 24 * 60 * 60 * 1000
      const date = new Date(timestamp).toJSON().split('T')[0]

      totals.set(date, {
        date: timestamp,
        sent: 0,
        received: 0,
        stakingReward: 0,
        miningReward: 0,
        incentiveReward: 0
      })
    }

    /** Add transaction amount if it is in the last 31 days window. */
    for (let txid of this.wallet.txKeys) {
      const tx = this.wallet.tx.get(txid)

      /** Break the loop once we're below the threshold. */
      if (tx.time < threshold) break

      /** Add the transaction amount. */
      const date = new Date(tx.time).toJSON().split('T')[0]

      if (totals.has(date) === true) {
        let total = totals.get(date)

        total[tx.category] =
          (total[tx.category] * coin + Math.abs(tx.amount) * coin) / coin
      }
    }

    return [...totals.values()]
  }

  /**
   * Get network rewards grouped per day for the last 31 days.
   * @function rewardsPerDay
   * @return {array} Network rewards.
   */
  @computed
  get rewardsPerDay() {
    /** Threshold for including transactions (today - 31 days). */
    const threshold = new Date().getTime() - 31 * 24 * 60 * 60 * 1000

    /** Populate the map with the last 31 dates. */
    let rewards = new Map()

    for (let i = 1; i <= 31; i++) {
      const timestamp = threshold + i * 24 * 60 * 60 * 1000
      const date = new Date(timestamp).toJSON().split('T')[0]

      rewards.set(date, {
        date: timestamp,
        stakingReward: 0,
        miningReward: 0,
        incentiveReward: 0
      })
    }

    /** Add to reward count if the transaction is in the last 31 days window. */
    for (let txid of this.wallet.generated) {
      const tx = this.wallet.tx.get(txid)

      /** Break the loop once we're below the threshold. */
      if (tx.time < threshold) break

      /** Increase reward count. */
      const date = new Date(tx.time).toJSON().split('T')[0]

      if (rewards.has(date) === true) {
        let total = rewards.get(date)
        total[tx.category] += 1
      }
    }

    return [...rewards.values()]
  }

  /**
   * Get reward spread for the last 31 days.
   * @function rewardSpread
   * @return {object} Reward spread.
   */
  @computed
  get rewardSpread() {
    /** Threshold for including transactions (today - 31 days). */
    const threshold = new Date().getTime() - 31 * 24 * 60 * 60 * 1000

    /** Populate the spread arrays with rewards. */
    let spread = {
      stakingReward: [],
      miningReward: [],
      incentiveReward: []
    }

    for (let txid of this.wallet.generated) {
      const tx = this.wallet.tx.get(txid)

      /** Break the loop once we're below the threshold. */
      if (tx.time < threshold) break

      /** Add reward to assigned spread array. */
      const date = new Date(tx.time)

      spread[tx.category].push({
        amount: tx.amount,
        category: tx.category,
        color: tx.color,
        date: tx.time,
        y:
          Math.round(
            date.getHours() * 60 * 60 +
              date.getMinutes() * 60 +
              date.getSeconds()
          ) * 1000
      })
    }

    return spread
  }

  /**
   * Save current network hash rate, PoW and PoS difficulties.
   * @function setNetworkByMinute
   */
  @action
  setNetworkByMinute() {
    this.networkByMinute.push({
      date: new Date().getTime(),
      posDifficulty: this.wallet.info['proof-of-stake'],
      powDifficulty: this.wallet.info['proof-of-work'],
      hashRate: this.wallet.info.networkhashps
    })

    /** Start a new timeout while RPC is ready. */
    if (this.rpc.ready === true) {
      this.updateTimeout = setTimeout(
        () => this.setNetworkByMinute(),
        60 * 1000
      )
    }
  }
}

/** Export store class as default export. */
export default Statistics
