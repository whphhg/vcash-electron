import { action, computed, observable, reaction } from 'mobx'
import moment from 'moment'

export default class Stats {
  /**
   * Observable properties.
   * @property {array} networkByMinute - Hash rate and diff. in 1min interval.
   */
  @observable networkByMinute = observable.array([])

  /**
   * @constructor
   * @param {object} info - Info store.
   * @param {object} rpc - RPC store.
   * @param {object} wallet - Wallet store.
   * @property {number|null} updateTimeout - setNetworkByMinute timeout id.
   */
  constructor (info, rpc, wallet) {
    this.info = info
    this.rpc = rpc
    this.wallet = wallet
    this.updateTimeout = null

    /** Begin updating when RPC becomes active. */
    reaction(() => this.rpc.ready, (ready) => {
      if (ready === true) {
        this.updateTimeout = setTimeout(() => {
          this.setNetworkByMinute()
        }, 3 * 1000)
      }

      /** Clear timeout when RPC becomes inactive */
      if (ready === false) clearTimeout(this.updateTimeout)
    })
  }

  /**
   * Push current network hash rate, pow and pos difficulties
   * to the network stats by minute array.
   * @function setNetworkByMinute
   */
  @action setNetworkByMinute () {
    this.networkByMinute.push({
      date: new Date().getTime(),
      posDifficulty: this.info.difficulty['proof-of-stake'],
      powDifficulty: this.info.difficulty['proof-of-work'],
      hashRate: this.info.mining.networkhashps
    })

    /** Set new timeout only while RPC is ready. */
    if (this.rpc.ready === true) {
      this.updateTimeout = setTimeout(() => {
        this.setNetworkByMinute()
      }, 60 * 1000)
    }
  }

  /**
   * Get saved network stats since UI launch.
   * @function stats
   * @return {array} Stats.
   */
  @computed get network () {
    return this.networkByMinute.length > 1
      ? [...this.networkByMinute]
      : [...this.networkByMinute, ...this.networkByMinute]
  }

  /**
   * Get daily totals for the last 31 days.
   * @function dailyTotals
   * @return {array} Daily totals by category.
   */
  @computed get dailyTotals () {
    /** Threshold for including transactions, today - 31 days. */
    const threshold = new Date().getTime() - (31 * 24 * 60 * 60 * 1000)

    /** Map with dates as keys. */
    let dailyTotals = new Map()

    /** Populate the dailyTotals map with dates. */
    for (let i = 1; i <= 31; i++) {
      const date = moment(threshold).add(i, 'day').format('YYYYMMDD')

      dailyTotals.set(date, {
        date: Math.round(moment(threshold).add(i, 'day').format('x')),
        sent: 0,
        received: 0,
        stakingReward: 0,
        miningReward: 0,
        incentiveReward: 0
      })
    }

    /** Add category counts to the dailyTotals map. */
    this.wallet.transactions.forEach((tx, txid) => {
      /** Check if tx time is in the last 31 days window. */
      if (tx.time > threshold) {
        const date = moment(tx.time).format('YYYYMMDD')

        if (dailyTotals.has(date) === true) {
          let saved = dailyTotals.get(date)
          saved[tx.category] += Math.round(Math.abs(tx.amount) * 1e6) / 1e6
        }
      }
    })

    /** Convert dailyTotals map to array. */
    return [...dailyTotals.values()]
  }

  /**
   * Get rewards per day for the last 31 days.
   * @function rewardsPerDay
   * @return {array} Rewards.
   */
  @computed get rewardsPerDay () {
    /** Threshold for including transactions, today - 31 days. */
    const threshold = new Date().getTime() - (31 * 24 * 60 * 60 * 1000)

    /** Map with dates as keys. */
    let rewardsPerDay = new Map()

    /** Populate the rewardsPerDay map with dates. */
    for (let i = 1; i <= 31; i++) {
      const date = moment(threshold).add(i, 'day').format('YYYYMMDD')

      rewardsPerDay.set(date, {
        date: Math.round(moment(threshold).add(i, 'day').format('x')),
        stakingReward: 0,
        miningReward: 0,
        incentiveReward: 0
      })
    }

    /** Add category counts to the rewardsPerDay map. */
    for (let i = 0; i < this.wallet.generated.length; i++) {
      const tx = this.wallet.generated[i]

      /** Check if tx time is in the last 31 days window. */
      if (tx.time > threshold) {
        const date = moment(tx.time).format('YYYYMMDD')

        if (rewardsPerDay.has(date) === true) {
          let saved = rewardsPerDay.get(date)
          saved[tx.category] = saved[tx.category] + 1
        }
      } else {
        /**
         * wallet.generated array is ordered by date,
         * so we exit once tx time goes below the threshold.
         */
        break
      }
    }

    /** Convert rewardsPerDay map to array. */
    return [...rewardsPerDay.values()]
  }

  /**
   * Get reward spread for the last 31 days.
   * @function rewardSpread
   * @return {object} Rewards.
   */
  @computed get rewardSpread () {
    /** Threshold for including transactions, today - 31 days. */
    const threshold = new Date().getTime() - (31 * 24 * 60 * 60 * 1000)

    let rewardSpread = {
      stakingReward: [],
      miningReward: [],
      incentiveReward: []
    }

    for (let i = 0; i < this.wallet.generated.length; i++) {
      const tx = this.wallet.generated[i]

      /** Check if tx time is in the last 31 days window. */
      if (tx.time > threshold) {
        const time = new Date(tx.time)

        rewardSpread[tx.category].push({
          y: Math.round(
            (time.getHours() * 60 * 60) +
            (time.getMinutes() * 60) +
            time.getSeconds()
          ) * 1000,
          date: tx.time,
          amount: tx.amount,
          category: tx.category,
          color: tx.color
        })
      } else {
        /**
         * wallet.generated array is ordered by date,
         * so we exit once tx time goes below the threshold.
         */
        break
      }
    }

    return rewardSpread
  }
}
