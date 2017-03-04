import { action, computed, observable, reaction } from 'mobx'
import { message } from 'antd'
import { shortUid } from '../utilities/common'
import i18next from '../utilities/i18next'

/** Required store instances. */
import rpc from './rpc'
import wallet from './wallet'

class Network {
  @observable difficulty = {
    'proof-of-work': 0,
    'proof-of-stake': 0,
    'search-interval': 0
  }

  @observable incentiveInfo = {
    walletaddress: '',
    collateralrequired: 0,
    collateralbalance: 0,
    networkstatus: 'firewalled',
    votecandidate: false,
    votescore: 0
  }

  @observable miningInfo = {
    blocks: 0,
    currentblocksize: 0,
    currentblocktx: 0,
    difficulty: 0,
    errors: '',
    generate: false,
    genproclimit: 0,
    hashespersec: 0,
    networkhashps: 0,
    pooledtx: 0,
    testnet: false
  }

  @observable networkInfo = observable.object({})
  @observable peerInfo = observable.array([])
  @observable statsByMinute = observable.array([])

  /**
   * @constructor
   * @property {number|null} loopTimeout - setTimeout id of getinfo().
   */
  constructor () {
    this.loopTimeout = null

    /** Start update loop when RPC becomes available. */
    reaction(() => rpc.status, (status) => {
      if (status === true) {
        this.restartLoop()
      }
    })

    /** Get fresh incentive info when the wallet unlocks. */
    reaction(() => wallet.isLocked, (isLocked) => {
      if (isLocked === false) {
        this.restartLoop()
      }
    }, { delay: 4000 })
  }

  /**
   * Get tcp connection count.
   * @function tcp
   * @return {number} TCP connections.
   */
  @computed get tcp () {
    if (this.networkInfo.hasOwnProperty('tcp') === true) {
      return this.networkInfo.tcp.connections
    }

    return 0
  }

  /**
   * Get udp connection count.
   * @function udp
   * @return {number} UDP connections.
   */
  @computed get udp () {
    if (this.networkInfo.hasOwnProperty('udp') === true) {
      return this.networkInfo.udp.connections
    }

    return 0
  }

  /**
   * Get the number of collateralized nodes.
   * @function collateralized
   * @return {number} Collateralized nodes.
   */
  @computed get collateralized () {
    if (this.networkInfo.hasOwnProperty('collateralized') === true) {
      return this.networkInfo.collateralized
    }

    return 0
  }

  /**
   * Get the number of endpoints.
   * @function endpoints
   * @return {number} Endpoints.
   */
  @computed get endpoints () {
    if (this.networkInfo.hasOwnProperty('endpoints') === true) {
      return this.networkInfo.endpoints.length
    }

    return 0
  }

  /**
   * Get array of peers.
   * @function peers
   * @return {array} Peers.
   */
  @computed get peers () {
    if (this.peerInfo.length > 0) {
      return this.peerInfo.reduce((peers, item) => {
        if (item.lastsend !== 0 && item.startingheight !== -1) {
          peers.push({
            ...item,
            key: shortUid(),
            version: item.subver.match(/\/(.*)\(/).pop().split(':')[1],
            os: item.subver.split(' ')[1].replace(')/', ''),
            ip: item.addr.split(':')[0],
            port: item.addr.split(':')[1]
          })
        }

        return peers
      }, [])
    }

    return []
  }

  /**
   * Get saved network stats since UI launch.
   * @function stats
   * @return {array} Stats.
   */
  @computed get stats () {
    return this.statsByMinute.length > 1
      ? [...this.statsByMinute]
      : [...this.statsByMinute, ...this.statsByMinute]
  }

  @action setResponses (responses) {
    this.networkInfo = responses[0].result
    this.peerInfo = responses[1].result

    const which = ['incentiveInfo', 'miningInfo', 'difficulty']

    responses.forEach((response, index) => {
      if (index > 1) {
        for (let i in response.result) {
          if (this[which[index - 2]][i] !== response.result[i]) {
            this[which[index - 2]][i] = response.result[i]
          }
        }
      }
    })

    /** Save timestamped difficulties and hashrate. */
    this.statsByMinute.push({
      date: new Date().getTime(),
      posDifficulty: responses[4].result['proof-of-stake'],
      powDifficulty: responses[4].result['proof-of-work'],
      hashRate: responses[3].result.networkhashps
    })
  }

  /**
   * Clear current loop timeout.
   * @function clearLoopTimeout
   */
  @action clearLoopTimeout () {
    clearTimeout(this.loopTimeout)
    this.loopTimeout = null
  }

  /**
   * Start new loop and save its timeout id.
   * @function setLoopTimeout
   */
  @action setLoopTimeout () {
    this.loopTimeout = setTimeout(() => {
      this.getinfo()
    }, 60 * 1000)
  }

  /**
   * Restart the update loop.
   * @function restartLoop
   */
  restartLoop () {
    this.clearLoopTimeout()
    this.getinfo()
  }

  /**
   * Get network and incentive info.
   * @function getinfo
   */
  getinfo () {
    rpc.call([
      {
        method: 'getnetworkinfo',
        params: []
      },
      {
        method: 'getpeerinfo',
        params: []
      },
      {
        method: 'getincentiveinfo',
        params: []
      },
      {
        method: 'getmininginfo',
        params: []
      },
      {
        method: 'getdifficulty',
        params: []
      }
    ], (response) => {
      if (response !== null) {
        this.setLoopTimeout()
        this.setResponses(response)
      }
    })
  }

  /**
   * Allow staking of incentive collateral.
   * @function incentiveStake
   */
  incentiveStake () {
    rpc.call([
      {
        method: 'incentive',
        params: ['stake']
      }
    ], (response) => {
      if (response !== null) {
        if (response[0].hasOwnProperty('result') === true) {
          /** Display a message. */
          message.success(i18next.t('wallet:incentiveStake'), 6)
        }
      }
    })
  }
}

/** Initialize a new globally used store. */
const network = new Network()

/**
 * Export initialized store as default export,
 * and store class as named export.
 */
export default network
export { Network }
