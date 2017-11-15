import { action, computed, extendObservable, runInAction } from 'mobx'

class Console {
  /**
   * @param {object} rpc - Connection instance RPC store.
   * @prop {string} command - RPC input field.
   * @prop {array} responses - RPC responses.
   */
  constructor(rpc) {
    this.rpc = rpc

    /** Extend the store with observable properties. */
    extendObservable(this, { command: '', responses: [] })
  }

  /**
   * Get execute button status.
   * @function executeStatus
   * @return {boolean} Execute button status.
   */
  @computed
  get executeStatus() {
    if (this.command.length < 4) return false
    if (this.options.params === null) return false
    return true
  }

  /**
   * Get RPC request options.
   * @function options
   * @return {object} RPC options.
   */
  @computed
  get options() {
    const command = this.command.split(/ (.+)/)
    const params = () => {
      try {
        return command.length > 1 ? JSON.parse(command[1]) : []
      } catch (e) {
        return null
      }
    }

    return { method: command[0], params: params() }
  }

  /**
   * Clear entered command and previous response(s).
   * @function reset
   */
  @action
  reset = () => {
    this.command = ''
    this.responses.clear()
  }

  /**
   * Set command.
   * @function setCommand
   * @param {string} input - AutoComplete element event.
   */
  @action
  setCommand = input => {
    this.command = input
  }

  /**
   * Execute the RPC command.
   * @function execute
   */
  @action
  async execute() {
    /** Do not execute the RPC command if the status is false. */
    if (this.executeStatus === false) return

    const res = await this.rpc.batch(
      [{ method: this.options.method, params: this.options.params }],
      true
    )

    runInAction(() => {
      this.responses.unshift(res)
    })
  }
}

/** Export store class as default export. */
export default Console
