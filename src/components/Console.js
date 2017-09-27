import React from 'react'
import { translate } from 'react-i18next'
import { action, computed, observable } from 'mobx'
import { inject, observer } from 'mobx-react'
import { AutoComplete, Button, Modal } from 'antd'
import { shortUid } from '../utilities/common'

/** RPC console component. */
@translate(['wallet'], { wait: true })
@inject('gui', 'rpcNext')
@observer
class Console extends React.Component {
  @observable command = ''
  @observable responses = observable.array([])
  @observable modalVisible = false

  constructor (props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.rpc = props.rpcNext

    /** Bind the async function. */
    this.execute = this.execute.bind(this)

    /** Toggle modal on Alt-c key press. */
    document.onkeydown = e => {
      if (e.altKey === true && e.keyCode === 67) this.toggleModal()
    }
  }

  /**
   * Get execute button status.
   * @function executeStatus
   * @return {boolean} Execute button status.
   */
  @computed
  get executeStatus () {
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
  get options () {
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
   * Add RPC response to the beginning of array.
   * @function setResponse
   * @param {object} response - RPC response.
   */
  @action
  setResponse = response => {
    this.responses.unshift(response)
  }

  /**
   * Toggle modal visibility.
   * @function toggleModal
   */
  @action
  toggleModal = () => {
    this.modalVisible = !this.modalVisible
  }

  /**
   * Execute the RPC command.
   * @function execute
   */
  async execute () {
    /** Do not execute the RPC command if the status is false. */
    if (this.executeStatus === false) return

    const response = await this.rpc.batch([
      { method: this.options.method, params: this.options.params }
    ])

    /** Set the response. */
    this.setResponse(response)
  }

  render () {
    return (
      <Modal
        footer={null}
        maskClosable={false}
        onCancel={this.toggleModal}
        style={{ minWidth: '800px' }}
        title={this.t('wallet:rpcConsole')}
        visible={this.modalVisible === true}
      >
        <div id='ConsoleGrid'>
          <div>
            {this.responses.map(response => (
              <pre key={shortUid()}>{JSON.stringify(response, null, 2)}</pre>
            ))}
          </div>
          <hr />
          <div className='flex'>
            <Button
              disabled={this.executeStatus !== true}
              onClick={this.execute}
              size='small'
            >
              {this.t('wallet:execute')}
            </Button>
            <div style={{ flex: 1, margin: '0 5px 0 5px' }}>
              <AutoComplete
                dataSource={this.rpc.methods}
                filterOption
                onChange={this.setCommand}
                placeholder={this.t('wallet:command')}
                style={{ width: '100%' }}
                value={this.command}
              />
            </div>
            <Button onClick={this.reset} size='small'>
              {this.t('wallet:reset')}
            </Button>
          </div>
        </div>
      </Modal>
    )
  }
}

export default Console
