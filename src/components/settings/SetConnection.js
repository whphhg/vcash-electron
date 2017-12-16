import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { remote } from 'electron'

/** Ant Design */
import Button from 'antd/lib/button'
import Input from 'antd/lib/input'
import Popconfirm from 'antd/lib/popconfirm'
import Switch from 'antd/lib/switch'

@translate(['wallet'])
@inject('connections')
@observer
class SetConnection extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.connections = props.connections
  }

  /**
   * Set connection property.
   * @function setProp
   * @param {object} e - Input element event.
   */
  setProp = e => {
    this.connections.viewing.setProp(e.target.name, e.target.value)
  }

  /**
   * Set private key file path.
   * @function setPrivateKey
   */
  setPrivateKey = () => {
    /** Open file browser. */
    const file = remote.dialog.showOpenDialog({ properties: ['openFile'] })

    /** Set selected path. */
    if (typeof file !== 'undefined') {
      this.connections.viewing.setProp('privateKey', file[0])
    }
  }

  /**
   * Toggle connection type.
   * @function toggleType
   * @param {boolean} checked - SSH checked status.
   */
  toggleType = checked => {
    this.connections.viewing.setProp('type', checked === true ? 'ssh' : 'local')
  }

  render() {
    const { status, startStatus, type } = this.connections.viewing
    return (
      <div id="Connection">
        <div className="flex" id="Header">
          <p style={{ fontWeight: 500 }}>{this.t('connManager')}</p>
        </div>
        <div className="flex-sb" style={{ alignItems: 'flex-start' }}>
          <div>
            <div className="flex">
              <div className="labels">
                <p>{this.t('address')}</p>
                <p>{this.t('rpcLocal')}</p>
              </div>
              <div className="flex inputs" style={{ flex: 1 }}>
                <Input disabled size="small" value="127.0.0.1" />
                <Input
                  disabled={status.active === true}
                  name="localPort"
                  onChange={this.setProp}
                  placeholder={this.t('port')}
                  size="small"
                  style={{ margin: '5px 0 0 0', width: '60px' }}
                  value={this.connections.viewing.localPort}
                />
              </div>
            </div>
            <hr />
            <div className="flex-sb">
              <Button
                disabled={startStatus !== true}
                onClick={
                  status.active === true
                    ? () => this.connections.viewing.stop()
                    : () => this.connections.viewing.start()
                }
                size="small"
                type="primary"
              >
                {status.active === true ? this.t('stop') : this.t('start')}
              </Button>
            </div>
          </div>
          <div style={{ margin: '0 0 0 25px', flex: 1 }}>
            <div className="flex" style={{ margin: '0 0 15px 0' }}>
              <Switch
                checked={type === 'ssh'}
                checkedChildren={
                  <div style={{ margin: '-2px 0 0 0' }}>
                    <i className="material-icons md-16">done</i>
                  </div>
                }
                disabled={status.active === true}
                onChange={this.toggleType}
                size="small"
                unCheckedChildren={
                  <div style={{ margin: '-2px 0 0 0' }}>
                    <i className="material-icons md-16">clear</i>
                  </div>
                }
              />
              <p style={{ margin: '0 0 0 10px' }}>{this.t('sshTunnel')}</p>
            </div>
            <div style={{ opacity: type === 'ssh' ? 1 : 0.5 }}>
              <div className="flex">
                <div className="labels">
                  <p>{this.t('address')}</p>
                  <p>{this.t('port')}</p>
                  <p>{this.t('rpcRemote')}</p>
                  <p>{this.t('user')}</p>
                  <p>{this.t('passphrase')}</p>
                  <p>{this.t('keyFile')}</p>
                </div>
                <div className="flex inputs" style={{ flex: 1 }}>
                  <Input
                    disabled={status.active === true || type !== 'ssh'}
                    name="host"
                    onChange={this.setProp}
                    placeholder={this.t('hostname')}
                    size="small"
                    style={{ margin: '0 0 5px 0' }}
                    value={this.connections.viewing.host}
                  />
                  <Input
                    disabled={status.active === true || type !== 'ssh'}
                    name="port"
                    onChange={this.setProp}
                    placeholder={this.t('port')}
                    size="small"
                    style={{ margin: '0 0 5px 0', width: '60px' }}
                    value={this.connections.viewing.port}
                  />
                  <Input
                    disabled={status.active === true || type !== 'ssh'}
                    name="dstPort"
                    onChange={this.setProp}
                    size="small"
                    style={{ margin: '0 0 5px 0', width: '60px' }}
                    value={this.connections.viewing.dstPort}
                  />
                  <Input
                    disabled={status.active === true || type !== 'ssh'}
                    name="username"
                    onChange={this.setProp}
                    placeholder={this.t('user')}
                    size="small"
                    style={{ margin: '0 0 5px 0', width: '120px' }}
                    value={this.connections.viewing.username}
                  />
                  <Input
                    disabled={status.active === true || type !== 'ssh'}
                    name="passphrase"
                    onChange={this.setProp}
                    placeholder={this.t('passphrase')}
                    size="small"
                    style={{ margin: '0 0 5px 0' }}
                    type="password"
                    value={this.connections.viewing.passphrase}
                  />
                  <div className="flex" style={{ width: '100%' }}>
                    <Button
                      disabled={status.active === true || type !== 'ssh'}
                      onClick={this.setPrivateKey}
                      size="small"
                      style={{ margin: '0 5px 0 0' }}
                    >
                      {this.t('browse')}
                    </Button>
                    <Input
                      disabled
                      size="small"
                      value={this.connections.viewing.privateKey}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-sb" style={{ overflow: 'hidden' }}>
          <Button onClick={() => this.connections.add()} size="small">
            <i className="flex-center material-icons md-16">
              add_circle_outline
            </i>
          </Button>
          <Popconfirm
            cancelText={this.t('no')}
            okText={this.t('yes')}
            onConfirm={() => this.connections.remove()}
            placement="topRight"
            title={this.t('connRemoveConfirm')}
          >
            <Button size="small" type="dashed">
              {this.t('connRemove')}
            </Button>
          </Popconfirm>
        </div>
      </div>
    )
  }
}

export default SetConnection
