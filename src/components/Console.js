import React from 'react'
import { translate } from 'react-i18next'
import { action, computed, observable } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Button, Input, Modal } from 'antd'
import { shortUid } from '../utilities/common'

@translate(['wallet'], { wait: true })
@inject('gui', 'rpc')
@observer
class Console extends React.Component {
  @observable command = ''
  @observable modal = false
  @observable responses = observable.array([])

  constructor (props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.rpc = props.rpc

    /** React to Alt-c key press and toggle console. */
    document.onkeydown = e => {
      if (e.altKey === true && e.keyCode === 67) {
        this.toggleModal()
      }
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
   * @param {object} e - Input element event.
   */
  @action
  setCommand = e => {
    this.command = e.target.value
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
   * Toggle modal.
   * @function toggleModal
   */
  @action
  toggleModal = () => {
    this.modal = !this.modal
  }

  /**
   * Execute the command.
   * @function execute
   */
  execute () {
    this.rpc.execute(
      [{ method: this.options.method, params: this.options.params }],
      response => {
        this.setResponse(response[0])
      }
    )
  }

  render () {
    return (
      <Modal
        footer={null}
        maskClosable={false}
        onCancel={this.toggleModal}
        style={{ minWidth: '800px' }}
        title={this.t('wallet:rpcConsole')}
        visible={this.modal === true}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateRows: '300px 1fr',
            height: '100%'
          }}
        >
          <div
            style={{
              fontSize: '11px',
              maxHeight: '300px',
              maxWidth: '765px',
              overflowY: 'scroll'
            }}
          >
            {this.responses.map(response =>
              <pre key={shortUid()}>{JSON.stringify(response, null, 2)}</pre>
            )}
          </div>
          <hr />
          <div className='flex'>
            <Button
              disabled={this.executeStatus !== true}
              onClick={() => this.execute()}
              size='small'
            >
              {this.t('wallet:execute')}
            </Button>
            <div style={{ flex: 1, margin: '0 5px 0 5px' }}>
              <Input
                onChange={this.setCommand}
                onPressEnter={() => {
                  this.executeStatus === true && this.execute()
                }}
                placeholder={this.t('wallet:command')}
                size='small'
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
