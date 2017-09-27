import React from 'react'
import { translate } from 'react-i18next'
import { withRouter } from 'react-router-dom'
import { reaction } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Button, Input, Modal, Popconfirm, Radio, Tabs, Tooltip } from 'antd'
import { remote } from 'electron'

/** Required components. */
import SelectCurrency from './SelectCurrency'
import SelectLanguage from './SelectLanguage'

/** Connections manager component. */
@translate(['wallet'], { wait: true })
@inject('connections', 'gui')
@observer
class Connections extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.connections = props.connections
    this.gui = props.gui

    /**
     * Redirect to the welcome screen if the viewing connection goes down
     * or temporarily redirect to the welcome screen to unmount previous
     * connection's components before redirecting to another connection.
     */
    reaction(
      () => {
        const conn = this.connections.configs.get(this.connections.viewing)

        if (typeof conn === 'undefined') return null
        return { uid: conn.uid, rpc: conn.status.rpc }
      },
      viewing => {
        if (viewing !== null) {
          if (this.props.history.location.pathname !== '/') {
            this.props.history.push('/')
          }

          if (viewing.rpc === true) {
            if (this.connections.modal === true) {
              this.connections.toggleModal()
            }

            /** Redirect to /:uid in 100ms. */
            setTimeout(() => this.props.history.push(viewing.uid), 0.1 * 1000)
          } else {
            if (this.connections.modal === false) {
              this.connections.toggleModal()
            }
          }
        }
      }
    )
  }

  /**
   * Set connection property.
   * @function setConfig
   * @param {object} e - Input element event.
   */
  setConfig = e => {
    console.warn(e)
    this.connections.setConfig(e.target.name, e.target.value)
  }

  /**
   * Set private key file path.
   * @function setPrivateKey
   */
  setPrivateKey = () => {
    /** Open file browser. */
    const selected = remote.dialog.showOpenDialog({ properties: ['openFile'] })

    /** Set selected file (mimic input element event object). */
    if (typeof selected !== 'undefined') {
      this.setConfig({ target: { name: 'privateKey', value: selected[0] } })
    }
  }

  render () {
    return (
      <Modal
        footer={null}
        onCancel={() => {
          this.props.history.location.pathname !== '/' &&
            this.connections.toggleModal()
        }}
        style={{ minWidth: '650px' }}
        title={this.t('wallet:connManager')}
        visible={this.connections.modal === true}
      >
        <Tabs
          activeKey={this.connections.viewing}
          onChange={uid => this.connections.setViewing(uid)}
          size='small'
          tabBarExtraContent={
            <Button
              onClick={() => this.connections.add()}
              size='small'
              style={{ margin: '7px 0 0 0' }}
            >
              +
            </Button>
          }
        >
          {this.connections.configs.values().map(conn => {
            const { active, rpc, tunnel } = conn.status

            return (
              <Tabs.TabPane
                key={conn.uid}
                tab={
                  conn.type === 'local'
                    ? '127.0.0.1' + ':' + conn.localPort
                    : conn.host + ':' + conn.port
                }
              >
                <div className='flex-sb'>
                  <div>
                    <Radio.Group
                      name='type'
                      onChange={this.setConfig}
                      value={conn.type}
                    >
                      <Radio
                        disabled={active === true && conn.type === 'ssh'}
                        value='local'
                      >
                        {this.t('wallet:connLocal')}
                      </Radio>
                      <Radio
                        disabled={active === true && conn.type === 'local'}
                        value='ssh'
                      >
                        {this.t('wallet:sshTunnel')}
                      </Radio>
                    </Radio.Group>
                  </div>
                  <div className='flex'>
                    <div
                      className={
                        'flex ' +
                        (rpc === null ? '' : rpc === true ? 'green' : 'red')
                      }
                    >
                      <i className='material-icons md-16'>power_settings_new</i>
                      <p>RPC</p>
                    </div>
                    <div
                      className={
                        'flex ' +
                        (tunnel === null
                          ? ''
                          : tunnel === true ? 'green' : 'red')
                      }
                      style={{ margin: '0 0 0 10px' }}
                    >
                      <i className='material-icons md-16'>power_settings_new</i>
                      <p>SSH</p>
                    </div>
                  </div>
                </div>
                <div
                  className='flex-sb'
                  style={{ margin: '10px 0 0 0', alignItems: 'flex-start' }}
                >
                  <div>
                    {conn.type === 'local' && (
                      <div className='flex'>
                        <Input
                          disabled
                          size='small'
                          style={{ width: '240px' }}
                          value='127.0.0.1'
                        />
                        <Input
                          disabled={active === true}
                          name='localPort'
                          onChange={this.setConfig}
                          placeholder={this.t('wallet:port')}
                          size='small'
                          style={{ margin: '0 0 0 5px', width: '60px' }}
                          value={conn.localPort}
                        />
                      </div>
                    )}
                    {conn.type === 'ssh' && (
                      <div>
                        <div className='flex'>
                          <Input
                            disabled={active === true}
                            name='host'
                            onChange={this.setConfig}
                            placeholder={this.t('wallet:hostname')}
                            size='small'
                            style={{ width: '240px' }}
                            value={conn.host}
                          />
                          <Input
                            disabled={active === true}
                            name='port'
                            onChange={this.setConfig}
                            placeholder={this.t('wallet:port')}
                            size='small'
                            style={{ margin: '0 0 0 5px', width: '60px' }}
                            value={conn.port}
                          />
                          <div style={{ margin: '0 0 0 5px' }}>
                            <Input.Group>
                              <Tooltip title={this.t('wallet:rpcRemote')}>
                                <Input
                                  disabled={active === true}
                                  name='dstPort'
                                  onChange={this.setConfig}
                                  size='small'
                                  style={{ width: '60px' }}
                                  value={conn.dstPort}
                                />
                              </Tooltip>
                              <Tooltip title={this.t('wallet:rpcLocal')}>
                                <Input
                                  disabled={active === true}
                                  name='localPort'
                                  onChange={this.setConfig}
                                  size='small'
                                  style={{ width: '60px' }}
                                  value={conn.localPort}
                                />
                              </Tooltip>
                            </Input.Group>
                          </div>
                        </div>
                        <div style={{ margin: '5px 0 0 0' }}>
                          <Input
                            disabled={active === true}
                            name='username'
                            onChange={this.setConfig}
                            placeholder={this.t('wallet:user')}
                            size='small'
                            style={{ width: '120px' }}
                            value={conn.username}
                          />
                          <Input
                            disabled={active === true}
                            name='password'
                            onChange={this.setConfig}
                            placeholder={this.t('wallet:passphrase')}
                            size='small'
                            style={{ margin: '0 0 0 5px', width: '305px' }}
                            type='password'
                            value={conn.password}
                          />
                        </div>
                        <div style={{ margin: '10px 0 0 0' }}>
                          <div className='flex' style={{ width: '430px' }}>
                            <Button
                              disabled={active === true}
                              onClick={this.setPrivateKey}
                              size='small'
                              style={{ margin: '0 5px 0 0' }}
                            >
                              {this.t('wallet:keyFile')}
                            </Button>
                            <Input
                              disabled
                              size='small'
                              style={{ flex: 1 }}
                              value={conn.privateKey}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    {active !== true && (
                      <Button
                        disabled={this.connections.startStatus !== true}
                        onClick={() => this.connections.start()}
                        size='small'
                      >
                        {this.t('wallet:start')}
                      </Button>
                    )}
                    {active === true && (
                      <Button
                        onClick={() => this.connections.stop()}
                        size='small'
                      >
                        {this.t('wallet:stop')}
                      </Button>
                    )}
                  </div>
                </div>
              </Tabs.TabPane>
            )
          })}
        </Tabs>
        <hr />
        <div className='flex-sb'>
          <div className='flex'>
            <div style={{ margin: '0 5px 0 0' }}>
              <SelectLanguage />
            </div>
            <SelectCurrency />
          </div>
          <div>
            <Popconfirm
              cancelText={this.t('wallet:no')}
              okText={this.t('wallet:yes')}
              onConfirm={() => this.connections.remove()}
              placement='bottom'
              title={this.t('wallet:connRemoveConfirm')}
            >
              <Button size='small'>{this.t('wallet:connRemove')}</Button>
            </Popconfirm>
          </div>
        </div>
      </Modal>
    )
  }
}

export default withRouter(Connections)
