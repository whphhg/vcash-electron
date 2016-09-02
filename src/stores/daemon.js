import { action, observable } from 'mobx'

/** Daemon store class. */
class Daemon {
  @observable isRunning

  /**
   * Prepare observable variable.
   * @constructor
   * @property {boolean} isRunning - Daemon running/not.
   */
  constructor() {
    this.isRunning = null
  }

  /**
   * Set daemon running.
   * @function setRunning
   * @param {boolean} isRunning - Daemon running/not.
   */
  @action setRunning(isRunning) {
    this.isRunning = isRunning
  }
}

const daemon = new Daemon()

export default daemon
export { Daemon }
