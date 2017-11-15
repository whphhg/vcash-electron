import { spawn } from 'child_process'
import { existsSync } from 'fs'
import { join } from 'path'

class Daemon {
  /**
   * @prop {object|null} process - Daemon process.
   */
  constructor() {
    this.process = null

    /** Spawn the daemon process on launch. */
    this.start()
  }

  /**
   * Start the daemon.
   * @function start
   */
  start() {
    const daemonName = ''.concat(
      'vcashd-',
      process.arch,
      process.platform === 'win32' ? '.exe' : ''
    )

    /** Prepare daemon path. */
    let path = join(__dirname, '..', '..', 'build', 'bin', daemonName)

    /** Execute from the unpacked asar directory when running packaged. */
    path = path.replace('app.asar', 'app.asar.unpacked')

    /** Check if the daemon exists and spawn it. */
    this.process = existsSync(path) === true ? spawn(path) : null

    if (this.process !== null) {
      /** Log daemon stderr in development mode. */
      this.process.stderr.on('data', data => {
        if (process.env.NODE_ENV === 'dev') console.log(data.toString().trim())
      })

      /** Log daemon exit. */
      this.process.on('exit', (code, signal) => {
        console.log('Daemon exited, code:', code, 'signal:', signal)
      })
    }
  }

  /**
   * Stop the daemon.
   * @function stop
   */
  stop() {
    if (this.process !== null) this.process.kill('SIGINT')
  }
}

/** Initialize a new globally used store. */
const daemon = new Daemon()

/** Export initialized store as default export & store class as named export. */
export default daemon
export { Daemon }
