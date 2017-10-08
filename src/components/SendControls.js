import React from 'react'
import { translate } from 'react-i18next'
import { action, extendObservable } from 'mobx'
import { inject, observer } from 'mobx-react'

/** Ant Design */
import Button from 'antd/lib/button'
import Popconfirm from 'antd/lib/popconfirm'
import Switch from 'antd/lib/switch'
import Tooltip from 'antd/lib/tooltip'

@translate(['wallet'], { wait: true })
@inject('rates', 'send', 'wallet')
@observer
class SendControls extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.rates = props.rates
    this.send = props.send
    this.wallet = props.wallet

    /** Extend the component with observable properties. */
    extendObservable(this, { popconfirmVisible: false })
  }

  /**
   * Toggle popconfirm visibility only when the wallet is unlocked.
   * @function togglePopconfirm
   */
  @action
  togglePopconfirm = () => {
    if (this.wallet.isLocked === false && this.send.errorStatus === false) {
      this.popconfirmVisible = !this.popconfirmVisible
    }
  }

  render() {
    return (
      <div className="flex-sb">
        <div className="flex">
          <Popconfirm
            cancelText={this.t('wallet:no')}
            okText={this.t('wallet:yes')}
            onConfirm={() => this.send.confirm()}
            onVisibleChange={this.togglePopconfirm}
            placement="bottom"
            title={this.t('wallet:sendConfirm')}
            visible={this.popconfirmVisible}
          >
            <Button
              disabled={
                this.wallet.isLocked === true ||
                this.wallet.info.balance < 0.0005 ||
                this.send.errorStatus !== false
              }
              size="small"
            >
              {this.t('wallet:send')}
            </Button>
          </Popconfirm>
          <Button
            disabled={this.wallet.spendFrom === '#'}
            onClick={() => this.send.addRecipient()}
            size="small"
            style={{ margin: '0 5px 0 5px' }}
          >
            <div style={{ margin: '2px 0 0 0' }}>
              <i className="material-icons md-16">person_add</i>
            </div>
          </Button>
          <Popconfirm
            cancelText={this.t('wallet:no')}
            okText={this.t('wallet:yes')}
            onConfirm={() => this.send.clear()}
            placement="bottom"
            title={this.t('wallet:sendReset')}
          >
            <Button size="small">{this.t('wallet:reset')}</Button>
          </Popconfirm>
        </div>
        <div className="flex">
          <i className="material-icons md-16">timer_off</i>
          <Tooltip placement="bottomLeft" title={this.t('wallet:zeroTime')}>
            <Switch
              checkedChildren={
                <div style={{ margin: '-2px 0 0 0' }}>
                  <i className="material-icons md-16">done</i>
                </div>
              }
              disabled
              size="small"
              style={{ margin: '0 20px 0 5px' }}
              unCheckedChildren={
                <div style={{ margin: '-2px 0 0 0' }}>
                  <i className="material-icons md-16">clear</i>
                </div>
              }
            />
          </Tooltip>
          <i className="material-icons md-16">shuffle</i>
          <Tooltip placement="bottomLeft" title={this.t('wallet:blendedOnly')}>
            <Switch
              checkedChildren={
                <div style={{ margin: '-2px 0 0 0' }}>
                  <i className="material-icons md-16">done</i>
                </div>
              }
              disabled
              size="small"
              style={{ margin: '0 0 0 5px' }}
              unCheckedChildren={
                <div style={{ margin: '-2px 0 0 0' }}>
                  <i className="material-icons md-16">clear</i>
                </div>
              }
            />
          </Tooltip>
        </div>
      </div>
    )
  }
}

export default SendControls
