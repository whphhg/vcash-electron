import React from 'react'
import { translate } from 'react-i18next'
import { action, extendObservable } from 'mobx'
import { inject, observer } from 'mobx-react'

/** Ant Design */
import Button from 'antd/lib/button'
import Popconfirm from 'antd/lib/popconfirm'

/** Component */
import SendTotal from './SendTotal.js'

@translate(['wallet'])
@inject('send', 'wallet')
@observer
class SendControls extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
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
        <div className="flex" style={{ flex: 1.4 }}>
          <Popconfirm
            cancelText={this.t('no')}
            okText={this.t('yes')}
            onConfirm={() => this.send.confirm()}
            onVisibleChange={this.togglePopconfirm}
            placement="bottom"
            title={this.t('sendConfirm')}
            visible={this.popconfirmVisible}
          >
            <Button
              disabled={
                this.wallet.isLocked === true ||
                this.wallet.info.balance < this.wallet.info.paytxfee ||
                this.send.errorStatus !== false
              }
              size="small"
            >
              {this.t('send')}
            </Button>
          </Popconfirm>
          <Button
            disabled={
              this.send.spend.fromAccount === '*ANY*' &&
              this.send.spend.utxo.length === 0
            }
            onClick={() => this.send.addRecipient()}
            size="small"
            style={{ margin: '0 5px 0 5px' }}
          >
            <div style={{ margin: '2px 0 0 0' }}>
              <i className="material-icons md-16">person_add</i>
            </div>
          </Button>
          <Popconfirm
            cancelText={this.t('no')}
            okText={this.t('yes')}
            onConfirm={() => this.send.clear()}
            placement="bottom"
            title={this.t('sendReset')}
          >
            <Button size="small">{this.t('reset')}</Button>
          </Popconfirm>
        </div>
        <SendTotal />
      </div>
    )
  }
}

export default SendControls
