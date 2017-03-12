import { action, computed, observable, reaction } from 'mobx'
import moment from 'moment'

/** Required store instances. */
import info from './info'
import rpc from './rpc'
import wallet from './wallet'

class Stats {
  /**
   * Observable properties.
   * @property {array} networkByMinute - Hash rate and diff. in 1min interval.
   */
  @observable networkByMinute = observable.array([])

  constructor () {
    /** Start updating network stats when RPC becomes available. */
    reaction(() => rpc.status, (status) => {
      if (status === true) {
        setTimeout(() => {
          this.setNetworkByMinute()
        }, 3 * 1000)
      }
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
      posDifficulty: info.difficulty['proof-of-stake'],
      powDifficulty: info.difficulty['proof-of-work'],
      hashRate: info.mining.networkhashps
    })

    /** Set new timeout only while RPC is available. */
    if (rpc.status === true) {
      setTimeout(() => {
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
    /** Treshold for including transactions, today - 31 days. */
    const threshold = new Date().getTime() - (31 * 24 * 60 * 60 * 1000)

    const today = moment(new Date())
    let data = []
    let dataByDate = []

    for (let i = 0; i < 31; i++) {
      const date = i === 0
        ? today.format('L')
        : today.subtract(1, 'day').format('L')

      /** Add to the beginning of arrays. */
      dataByDate.unshift(date)
      data.unshift({
        date: Math.round(today.format('x')),
        sent: 0,
        received: 0,
        stakingReward: 0,
        miningReward: 0,
        incentiveReward: 0
      })
    }

    wallet.txids.forEach((tx, txid) => {
      /** Check if time is in the last 31 days window. */
      if (tx.time > threshold) {
        const txDate = moment(tx.time).format('L')
        const index = dataByDate.indexOf(txDate)

        if (index > -1) {
          if (data[index].hasOwnProperty(tx.category) === true) {
            data[index][tx.category] += Math.round(Math.abs(tx.amount) * 1e6) / 1e6
          }
        }
      }
    })

    return data
  }

  /**
   * Get rewards per day for the last 31 days.
   * @function rewardsPerDay
   * @return {array} Rewards.
   */
  @computed get rewardsPerDay () {
    /** Treshold for including transactions, today - 31 days. */
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
    for (let i = 0; i < wallet.generated.length; i++) {
      const tx = wallet.generated[i]

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
    /** Treshold for including transactions, today - 31 days. */
    const threshold = new Date().getTime() - (31 * 24 * 60 * 60 * 1000)

    let rewardSpread = {
      stakingReward: [],
      miningReward: [],
      incentiveReward: []
    }

    for (let i = 0; i < wallet.generated.length; i++) {
      const tx = wallet.generated[i]

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

/** Initialize a new globally used store. */
const stats = new Stats()

/**
 * Export initialized store as default export,
 * and store class as named export.
 */
export default stats
export { Stats }
