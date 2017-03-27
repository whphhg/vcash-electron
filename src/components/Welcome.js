/** TODO: Remote RPC using tunnel-ssh, ssh -L9195:localhost:9195 user@ip. */

import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Button, Input } from 'antd'

/** Required components. */
import SelectCurrency from './SelectCurrency'
import SelectLanguage from './SelectLanguage'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('rpc') @observer

export default class Welcome extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.rpc = props.rpc
  }

  /**
   * Set RPC port.
   * @function setPort
   * @param {object} e - Input element event.
   */
  setPort = (e) => {
    this.rpc.setPort(e.target.value)
  }

  /**
   * Start the UI.
   * @function start
   */
  start = () => {
    this.rpc.setStarted()
  }

  render () {
    return (
      <div
        style={{
          background: '#b60127',
          overflow: 'auto',
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        }}
      >
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            height: '100%',
            justifyContent: 'center'
          }}
        >
          <div style={{color: '#ffffff', textAlign: 'center'}}>
            <img src='./assets/images/logoGrey.png' />
            <p style={{margin: '30px 0 10px 0', fontWeight: '500'}}>
              Vcash Electron UI {process.env.npm_package_version}
            </p>
            <Button style={{width: '256px', margin: '0 0 20px 0'}}
              onClick={this.start}
              disabled={this.rpc.reachable === false}
              loading={this.rpc.reachable === false}
            >
              {
                this.rpc.reachable === true
                  ? this.t('wallet:start')
                  : this.t('wallet:rpcUnreachable')
              }
            </Button>
            <div>
              <div style={{float: 'left'}}>
                <SelectLanguage />
              </div>
              <div style={{float: 'left'}}>
                <SelectCurrency />
              </div>
              <div style={{float: 'left', margin: '0 0 0 10px'}}>
                <Input
                  size='small'
                  style={{width: '60px'}}
                  addonBefore='RPC'
                  placeholder='9195'
                  onChange={this.setPort}
                  value={this.rpc.enteredPort}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
