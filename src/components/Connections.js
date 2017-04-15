/**
 * TODO: Disable start button if there are missing input fields.
 * type === local: localPort
 * type === ssh: localPort, dstPort, host, port, user, password || privateKey
 */

import React from 'react'
import { translate } from 'react-i18next'
import { withRouter } from 'react-router-dom'
import { action, observable, reaction } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Button, Col, Input, Modal, Popconfirm, Radio, Row, Tabs, Tooltip } from 'antd'
import { remote } from 'electron'

/** Required components. */
import SelectCurrency from './SelectCurrency'
import SelectLanguage from './SelectLanguage'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('connections', 'gui') @observer

class Connections extends React.Component {
  @observable modal = true
  @observable tab = ''

  constructor (props) {
    super(props)
    this.t = props.t
    this.connections = props.connections
    this.gui = props.gui

    /** React to shift-asd key presses. */
    document.onkeydown = (e) => {
      if (e.shiftKey === true) {
        /** Shift-ad: View previous or next active connection. */
        if (e.keyCode === 65 || e.keyCode === 68) {
          const length = this.connections.active.length

          if (length > 1 && this.connections.viewing !== '') {
            const index = this.connections.active.indexOf(this.connections.viewing)

            /** Shift-a: Move to the left. */
            if (e.keyCode === 65) {
              /** Return to the end if we hit the beginning. */
              if (index === 0) {
                this.view(this.connections.active[length - 1])
              } else {
                this.view(this.connections.active[index - 1])
              }
            }

            /** Shift-d: Move to the right. */
            if (e.keyCode === 68) {
              /** Return to the beginning if we hit the end. */
              if (index + 1 === length) {
                this.view(this.connections.active[0])
              } else {
                this.view(this.connections.active[index + 1])
              }
            }
          }
        }

        /** Shift-s: Toggle connection manager. */
        if (e.keyCode === 83) this.toggleModal()
      }
    }

    /** Switch to the same view tab is on. */
    reaction(() => this.tab, (uid) => {
      const conn = this.connections.saved.get(uid)

      if (conn.status.rpc === true) {
        this.connections.setViewing(uid)
      } else {
        this.connections.setViewing()
      }
    })

    /** Set initially active tab. */
    reaction(() => this.connections.uids, (uids) => {
      /** Set initial tab if we have saved more than 1 connection. */
      if (this.tab === '') this.setTab(uids[0])

      /** Switch to the new tab if removing the last tab. */
      if (uids.length === 1) this.setTab(uids[0])
    }, true)

    /**
     * Redirect to the welcome screen if the viewing connection goes down
     * or temporarily redirect to the welcome screen to unmount previous
     * connection's components before redirecting to another active connection.
     */
    reaction(() => this.connections.viewing, (viewing) => {
      if (this.props.history.location.pathname !== '/') {
        this.props.history.push('/')
      }

      if (viewing === '') {
        /** Open modal if it's closed. */
        if (this.modal === false) this.toggleModal()
      } else {
        /** Redirect to /:uid in 100ms. */
        setTimeout(() => { this.props.history.push(viewing) }, 0.1 * 1000)
      }
    })
  }

  /**
   * Set active tab.
   * @function setTab
   * @param {string} uid - Connection uid.
   */
  @action setTab = (uid) => {
    this.tab = uid
  }

  /**
   * Toggle modal.
   * @function toggleModal
   */
  @action toggleModal = () => {
    if (this.connections.viewing !== '') this.modal = !this.modal
  }

  /**
   * Add connection.
   * @function add
   */
  add = () => {
    this.connections.add()

    /** Switch to the added tab. */
    this.setTab(this.connections.uids[this.connections.uids.length - 1])
  }

  /**
   * Remove connection.
   * @function remove
   */
  remove = () => {
    const index = this.connections.uids.indexOf(this.tab)
    const length = this.connections.uids.length

    /** Remove the connection. */
    this.connections.remove(this.tab)

    /**
     * Switch to the next last tab if removing the last tab, or switch
     * to the next tab with the same index as the one we're removing.
     */
    if (length > 2) {
      if (index + 1 === length) {
        this.setTab(this.connections.uids[index - 1])
      } else {
        this.setTab(this.connections.uids[index])
      }
    }
  }

  /**
   * Set connection property.
   * @function set
   * @param {object} e - Input element event.
   */
  set = (e) => {
    this.connections.set(this.tab, e.target.name, e.target.value)
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
      this.set({
        target: { name: 'privateKey', value: selected[0] }
      })
    }
  }

  /**
   * Start connection.
   * @function start
   */
  start = () => {
    this.connections.start(this.tab)
  }

  /**
   * Stop connection.
   * @function stop
   */
  stop = () => {
    this.connections.stop(this.tab)
  }

  /**
   * View connection.
   * @function view
   * @param {string} uid - Connection uid.
   */
  view = (uid) => {
    /** Update viewing connection uid. */
    this.connections.setViewing(uid)

    /** Close modal if it's open. */
    if (this.modal === true) this.toggleModal()
  }

  render () {
    const { saved, viewing } = this.connections

    return (
      <Modal
        footer={null}
        onCancel={this.toggleModal}
        style={{minWidth: '650px'}}
        title={this.t('wallet:connectionManager')}
        visible={this.modal === true}
      >
        <Tabs
          activeKey={this.tab}
          onChange={this.setTab}
          size='small'
          tabBarExtraContent={
            <Button
              onClick={this.add}
              size='small'
              style={{margin: '7px 0 0 0'}}
            >
              +
            </Button>
          }
        >
          {
            saved.values().map(connection => {
              const { active, rpc, tunnel } = connection.status

              return (
                <Tabs.TabPane
                  key={connection.uid}
                  tab={
                    connection.type === 'local'
                      ? '127.0.0.1' + ':' + connection.localPort
                      : connection.host + ':' + connection.port
                  }
                >
                  <Row>
                    <div style={{float: 'left'}}>
                      <div style={{margin: '2px 0 0 0'}}>
                        <Radio.Group
                          onChange={this.set}
                          value={connection.type}
                        >
                          <Radio
                            disabled={
                              active === true && connection.type !== 'local'
                            }
                            name='type'
                            value='local'
                          >
                            {this.t('wallet:connectionLocal')}
                          </Radio>
                          <Radio
                            disabled={
                              active === true && connection.type !== 'ssh'
                            }
                            name='type'
                            value='ssh'
                          >
                            {this.t('wallet:sshTunnel')}
                          </Radio>
                        </Radio.Group>
                      </div>
                    </div>
                    <div style={{float: 'right'}}>
                      <div
                        className={
                          rpc === null
                            ? ''
                            : rpc === true
                              ? 'green'
                              : 'red'
                        }
                        style={{display: 'inline'}}
                      >
                        <i className='material-icons md-18'>
                          power_settings_new
                        </i>
                        <p
                          style={{
                            display: 'inline-block',
                            margin: '0 15px 0 5px',
                            verticalAlign: '4px'
                          }}
                        >
                          RPC
                        </p>
                      </div>
                      <div
                        className={
                          tunnel === null
                            ? ''
                            : tunnel === true
                              ? 'green'
                              : 'red'
                        }
                        style={{display: 'inline'}}
                      >
                        <i className='material-icons md-18'>
                          power_settings_new
                        </i>
                        <p
                          style={{
                            display: 'inline-block',
                            margin: '0 0 0 5px',
                            verticalAlign: '4px'
                          }}
                        >
                          SSH
                        </p>
                      </div>
                    </div>
                  </Row>
                  <Row style={{margin: '12px 0 0 0'}}>
                    <Col span={17}>
                      {
                        connection.type === 'local' && (
                          <div>
                            <Input
                              disabled
                              size='small'
                              style={{width: '200px'}}
                              value='127.0.0.1'
                            />
                            <Input
                              disabled={active === true}
                              name='localPort'
                              onChange={this.set}
                              placeholder={this.t('wallet:port')}
                              size='small'
                              style={{margin: '0 0 0 5px', width: '60px'}}
                              value={connection.localPort}
                            />
                          </div>
                        )
                      }
                      {
                        connection.type === 'ssh' && (
                          <div>
                            <Row>
                              <div style={{float: 'left'}}>
                                <Input
                                  disabled={active === true}
                                  name='host'
                                  onChange={this.set}
                                  placeholder={this.t('wallet:hostname')}
                                  size='small'
                                  style={{width: '200px'}}
                                  value={connection.host}
                                />
                                <Input
                                  disabled={active === true}
                                  name='port'
                                  onChange={this.set}
                                  placeholder={this.t('wallet:port')}
                                  size='small'
                                  style={{margin: '0 0 0 5px', width: '60px'}}
                                  value={connection.port}
                                />
                              </div>
                              <div style={{float: 'left', margin: '0 0 0 5px'}}>
                                <Input.Group>
                                  <Tooltip title={this.t('wallet:rpcRemote')}>
                                    <Input
                                      disabled={active === true}
                                      name='dstPort'
                                      onChange={this.set}
                                      size='small'
                                      style={{width: '60px'}}
                                      value={connection.dstPort}
                                    />
                                  </Tooltip>
                                  <Tooltip title={this.t('wallet:rpcLocal')}>
                                    <Input
                                      disabled={active === true}
                                      name='localPort'
                                      onChange={this.set}
                                      size='small'
                                      style={{width: '60px'}}
                                      value={connection.localPort}
                                    />
                                  </Tooltip>
                                </Input.Group>
                              </div>
                            </Row>
                            <Row style={{margin: '5px 0 0 0'}}>
                              <Input
                                disabled={active === true}
                                name='username'
                                onChange={this.set}
                                placeholder={this.t('wallet:user')}
                                size='small'
                                style={{width: '100px'}}
                                value={connection.username}
                              />
                              <Input
                                disabled={active === true}
                                name='password'
                                onChange={this.set}
                                placeholder={this.t('wallet:passphrase')}
                                size='small'
                                style={{margin: '0 0 0 5px', width: '285px'}}
                                type='password'
                                value={connection.password}
                              />
                            </Row>
                            <Row style={{margin: '10px 0 0 0'}}>
                              <div
                                style={{
                                  display: 'flex',
                                  flexDirection: 'row',
                                  width: '390px'
                                }}
                              >
                                <Button
                                  disabled={active === true}
                                  onClick={this.setPrivateKey}
                                  size='small'
                                  style={{margin: '0 5px 0 0'}}
                                >
                                  {this.t('wallet:keyFile')}
                                </Button>
                                <Input
                                  disabled
                                  size='small'
                                  style={{flex: 1}}
                                  value={connection.privateKey}
                                />
                              </div>
                            </Row>
                          </div>
                        )
                      }
                    </Col>
                    <Col span={7} style={{textAlign: 'right'}}>
                      <Button.Group>
                        {
                          (
                            active !== true && (
                              <Button
                                onClick={this.start}
                                size='small'
                              >
                                {this.t('wallet:start')}
                              </Button>
                            )
                          ) || (
                            <Button
                              disabled={active === false}
                              onClick={this.stop}
                              size='small'
                            >
                              {this.t('wallet:stop')}
                            </Button>
                          )
                        }

                        <Button
                          disabled={
                            rpc !== true ||
                            connection.uid === viewing
                          }
                          onClick={() => this.view(connection.uid)}
                          size='small'
                          type='primary'
                        >
                          {this.t('wallet:wallet')}
                        </Button>
                      </Button.Group>
                    </Col>
                  </Row>
                </Tabs.TabPane>
              )
            })
          }
        </Tabs>
        <hr />
        <div style={{overflow: 'hidden'}}>
          <div style={{float: 'left'}}>
            <SelectLanguage />
            <SelectCurrency />
          </div>
          <div style={{float: 'right'}}>
            <Popconfirm
              cancelText={this.t('wallet:no')}
              okText={this.t('wallet:yes')}
              onConfirm={this.remove}
              placement='bottom'
              title={this.t('wallet:connectionRemoveConfirm')}
            >
              <Button size='small'>
                {this.t('wallet:connectionRemove')}
              </Button>
            </Popconfirm>
          </div>
        </div>
      </Modal>
    )
  }
}

export default withRouter(Connections)
