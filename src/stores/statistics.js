import { action, computed, extendObservable, reaction, runInAction } from 'mobx'
import { coin } from '../utilities/common'

class Statistics {
  /**
   * @param {object} rpc - Connection instance RPC store.
   * @param {object} wallet - Connection instance Wallet store.
   * @prop {object} timeouts - Update loops timeouts.
   * @prop {array} networkRates - Hash rate and difficulties in 1 min interval.
   * @prop {array} recentBlocks - Short descriptions of recent blocks.
   */
  constructor(rpc, wallet) {
    this.rpc = rpc
    this.wallet = wallet
    this.timeouts = { networkRates: null, recentBlocks: null }

    /** Extend the store with observable properties. */
    extendObservable(this, { networkRates: [], recentBlocks: [] })

    /** Start update loop or cleanup after RPC connectivity change. */
    reaction(
      () => this.rpc.ready,
      ready => {
        if (ready === true) {
          this.timeouts.networkRates = setTimeout(
            () => this.setNetworkRates(),
            3 * 1000
          )
        }

        if (ready === false) {
          /** Clear auto-update timeouts when RPC becomes unreachable. */
          clearTimeout(this.timeouts.networkRates)
          clearTimeout(this.timeouts.recentBlocks)
        }
      },
      { name: 'Statistics: RPC ready changed, adjusting update loops.' }
    )

    /** Update recent block list on every block change. */
    reaction(
      () => this.wallet.info.blocks,
      block => this.updateRecentBlocks(),
      { name: 'Statistics: new block found, updating recent block list.' }
    )
  }

  /**
   * Get network rewards grouped by day for the last 31 days.
   * @function dailyRewards
   * @return {array} Network rewards.
   */
  @computed
  get dailyRewards() {
    /** Threshold for including transactions (today - 31 days). */
    const threshold = new Date().getTime() - 31 * 24 * 60 * 60 * 1000

    /** Populate the map with the last 31 dates. */
    let rewards = new Map()

    for (let i = 1; i <= 31; i++) {
      const timestamp = threshold + i * 24 * 60 * 60 * 1000
      const date = new Date(timestamp).toLocaleString().split(',')[0]

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
      const date = new Date(tx.time).toLocaleString().split(',')[0]

      if (rewards.has(date) === true) {
        let total = rewards.get(date)
        total[tx.category] += 1
      }
    }

    return [...rewards.values()]
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
      const date = new Date(timestamp).toLocaleString().split(',')[0]

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
      const date = new Date(tx.time).toLocaleString().split(',')[0]

      if (totals.has(date) === true) {
        let total = totals.get(date)

        total[tx.category] =
          (total[tx.category] * coin + Math.abs(tx.amount) * coin) / coin
      }
    }

    return [...totals.values()]
  }

  /**
   * Get saved network statistics.
   * @function network
   * @return {array} Network statistics by minute.
   */
  @computed
  get network() {
    return this.networkRates.length > 1
      ? [...this.networkRates]
      : [...this.networkRates, ...this.networkRates]
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
   * @function setNetworkRates
   */
  @action
  setNetworkRates() {
    this.networkRates.push({
      date: new Date().getTime(),
      hashRate: this.wallet.info.networkhashps,
      posDifficulty: this.wallet.info['proof-of-stake'],
      powDifficulty: this.wallet.info['proof-of-work']
    })

    /** Start a new timeout while RPC is ready. */
    if (this.rpc.ready === true) {
      this.timeouts.networkRates = setTimeout(
        () => this.setNetworkRates(),
        60 * 1000
      )
    }
  }

  /**
   * Add latest block(s) to the recent blocks list.
   * @function updateRecentBlocks
   */
  @action
  async updateRecentBlocks() {
    const blocks = this.recentBlocks.length === 0 ? this.wallet.info.blocks : -1
    const startFrom = blocks === -1 ? this.recentBlocks[0].height + 1 : blocks

    /** Add new blocks since last update. */
    let lookupHashes = []

    for (let i = startFrom; i <= this.wallet.info.blocks; i++) {
      lookupHashes.push({ method: 'getblockhash', params: [i] })
    }

    /** Get block hashes. */
    const resHashes = await this.rpc.batch(lookupHashes)
    if ('res' in resHashes === false) return

    /** Get blocks. */
    const lookupBlocks = resHashes.res.reduce((lookupBlocks, hash) => {
      if ('result' in hash === true) {
        lookupBlocks.push({ method: 'getblock', params: [hash.result] })
      }

      return lookupBlocks
    }, [])

    const resBlocks = await this.rpc.batch(lookupBlocks)
    if ('res' in resBlocks === false) return

    /** Update recent blocks. */
    runInAction(() => {
      for (let block of resBlocks.res) {
        if ('result' in block === true) {
          this.recentBlocks.unshift({
            height: block.result.height,
            size: block.result.size,
            time: block.result.time * 1000,
            txCount: block.result.tx.length,
            type: block.result.flags === 'proof-of-work' ? 'PoW' : 'PoS'
          })
        }
      }
    })
  }
}

/** Export store class as default export. */
export default Statistics
