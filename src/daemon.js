import { spawn } from 'child_process'
import { existsSync } from 'fs'
import { join } from 'path'

/**
 * Start OS specific daemon executable.
 * @function start
 * @return {object|null} Child process or null.
 */
const start = () => {
  let executable = null

  switch (process.platform) {
    case 'win32':
      executable = 'vcashd.exe'
      break

    default:
      executable = 'vcashd'
  }

  /** Prepare daemon path. */
  const path = join(__dirname, '..', 'bin', executable)

  /** Check if daemon exists and spawn it. */
  const daemon = existsSync(path) === true
    ? spawn(path)
    : null

  if (daemon !== null) {
    /** Log daemon stderr in dev mode. */
    daemon.stderr.on('data', (data) => {
      process.env.NODE_ENV === 'dev' && console.log(data.toString().trim())
    })

    /** Log daemon exit. */
    daemon.on('exit', (code, signal) => {
      console.log('Daemon exited, code:', code, 'signal:', signal)
    })
  }

  return daemon
}

/** Start daemon executable. */
const daemon = start()

/** Export child process. */
export default daemon
