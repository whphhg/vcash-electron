import { action, observable } from 'mobx'

/** RPC store class. */
class RPC {
  @observable status

  constructor() {
    this.status = null
  }

  call(options, callback) {
    options.map((option) => {
      option.jsonrpc = '2.0'
      option.id = Math.floor(Math.random() * 10000)
    })

    fetch('http://127.0.0.1:9195', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(options)
    })
    .then((response) => {
      if (response.ok) return response.json()
    })
    .then((data) => {
      if (this.status !== true) this.setStatus(true)

      /** Return RPC response. */
      return callback(data)
    })
    .catch((error) => {
      if (this.status !== false) this.setStatus(false)

      /** Return null, signaling failed RPC. */
      return callback(null)
    })
  }

  @action setStatus(status) {
    this.status = status
  }
}

/** Initialize a new globally used store. */
const rpc = new RPC()

/** Export both, initialized store as default export, and store class as named export. */
export default rpc
export { RPC }
