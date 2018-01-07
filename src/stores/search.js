import { action, computed, extendObservable } from 'mobx'
import moment from 'moment'

class Search {
  /**
   * @param {object} gui - Global GUI store.
   * @param {object} rates - Global Rates store.
   * @param {object} send - Connection instance Send store.
   * @param {object} wallet - Connection instance Wallet store.
   * @prop {object} txGroups - Categories grouped by transaction types.
   * @prop {object} find - Keywords used to search through addr and tx.
   * @prop {object} show - Types of entries to show in addr and tx.
   */
  constructor(gui, rates, send, wallet) {
    this.gui = gui
    this.rates = rates
    this.send = send
    this.wallet = wallet
    this.txGroups = {
      received: ['receiving', 'received'],
      sent: ['sending', 'sent'],
      sentSelf: ['sendingSelf', 'sentSelf'],
      blended: ['blending', 'blended'],
      rewards: ['stakingReward', 'miningReward', 'incentiveReward']
    }

    /** Extend the store with observable properties. */
    extendObservable(this, {
      find: {
        addr: { value: '', keywords: [], timeoutId: null },
        tx: { value: '', keywords: [], timeoutId: null }
      },
      show: {
        addr: { new: true, spendable: true, spent: false },
        tx: {
          received: true,
          sent: true,
          sentSelf: true,
          blended: true,
          rewards: true
        }
      }
    })
  }

  /**
   * Get a list of addresses that pass the searching criteria.
   * @function addr
   * @return {array} Addresses.
   */
  @computed
  get addr() {
    const fromAccount = this.send.spend.fromAccount
    const keywordCount = this.find.addr.keywords.length

    /** Check if any address type is hidden. */
    const showAll = Object.keys(this.show.addr).reduce((result, type) => {
      if (this.show.addr[type] === false) return false
      return result
    }, true)

    /** Return all addresses by default. */
    if (showAll === true && keywordCount === 0 && fromAccount === '*ANY*') {
      return this.wallet.addrKeys
    }

    /** Return filtered addresses. */
    return this.wallet.addr
      .values()
      .reduce((filtered, addr) => {
        /** Skip addresses of hidden types. */
        if (this.show.addr.new === false) {
          if (addr.received === 0) return filtered
        }

        if (this.show.addr.spendable === false) {
          if (addr.received !== addr.spent) return filtered
        }

        if (this.show.addr.spent === false) {
          if (addr.received === addr.spent && addr.received > 0) return filtered
        }

        /** Filter addresses by account. */
        if (
          fromAccount === '*ANY*' ||
          fromAccount === addr.account ||
          (fromAccount === '*DEFAULT*' && addr.account === '')
        ) {
          /** Allow searching for balances using the local notation. */
          const balance = new Intl.NumberFormat(this.gui.language, {
            minimumFractionDigits: 6,
            maximumFractionDigits: 6
          }).format(addr.balance)

          /** Check if all keywords match once. */
          const matches = this.find.addr.keywords.reduce((matches, keyword) => {
            if (
              balance.indexOf(keyword) > -1 ||
              addr.address.indexOf(keyword) > -1
            ) {
              return matches + 1
            }

            return matches
          }, 0)

          /** Add addresses with matches equal to the number of keywords. */
          if (matches === keywordCount) filtered.push(addr.address)
        }

        return filtered
      }, [])
      .reverse()
  }

  /**
   * Get a list of transaction IDs that pass the searching criteria.
   * @function tx
   * @return {array} Transaction IDs.
   */
  @computed
  get tx() {
    const keywordCount = this.find.tx.keywords.length

    /** Create a list of shown categories and all shown indicator. */
    const show = Object.keys(this.show.tx).reduce(
      (show, type) => {
        if (this.show.tx[type] === true) {
          show.categories = show.categories.concat(this.txGroups[type])
        } else {
          show.all = false
        }

        return show
      },
      { all: true, categories: [] }
    )

    /** Return all transactions by default. */
    if (show.all === true && keywordCount === 0) return this.wallet.txKeys

    /** Return filtered transactions in original (DESC) order. */
    return this.wallet.tx
      .values()
      .reduce((filtered, tx) => {
        /** Skip transactions from hidden categories. */
        if (show.categories.includes(tx.category) === false) return filtered

        /** Allow searching for amounts using the local notation. */
        const amount = new Intl.NumberFormat(this.gui.language, {
          maximumFractionDigits: 6
        }).format(tx.amount)

        const amountLocal = new Intl.NumberFormat(this.gui.language, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(tx.amount * this.rates.average * this.rates.local)

        /** Allow searching for dates using the local notation. */
        const time = moment(tx.time).format('L - LTS')

        /** Check if all keywords match once. */
        const matches = this.find.tx.keywords.reduce((matches, keyword) => {
          if (
            amount.indexOf(keyword) > -1 ||
            amountLocal.indexOf(keyword) > -1 ||
            tx.txid.indexOf(keyword) > -1 ||
            time.indexOf(keyword) > -1 ||
            (tx.blockhash && tx.blockhash.indexOf(keyword) > -1) ||
            (tx.comment && tx.comment.indexOf(keyword) > -1)
          ) {
            return matches + 1
          }

          return matches
        }, 0)

        /** Add transactions with matches equal to the number of keywords. */
        if (matches === keywordCount) filtered.push(tx.txid)
        return filtered
      }, [])
      .reverse()
  }

  /**
   * Set keywords.
   * @function setKeywords
   * @param {string} key - this.find group (addr / tx).
   * @param {string} searchString - Input element value.
   */
  @action
  setKeywords(key, searchString) {
    /** Clear previous timeout id. */
    clearTimeout(this.find[key].timeoutId)

    /** Update search string. */
    this.find[key].value = searchString

    /** Update keywords array in 1s, unless there's more input. */
    this.find[key].timeoutId = setTimeout(
      action('setKeywords', () => {
        this.find[key].keywords = searchString.match(/[^ ]+/g) || []
      }),
      1 * 1000
    )
  }

  /**
   * Toggle show type.
   * @function toggleShow
   * @param {string} key - this.show group (addr / tx).
   * @param {string} type - Type of entries to toggle.
   */
  @action
  toggleShow(key, type) {
    this.show[key][type] = !this.show[key][type]
  }
}

/** Export store class as default export. */
export default Search
