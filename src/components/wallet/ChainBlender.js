import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'

/** Ant Design */
import Button from 'antd/lib/button'
import message from 'antd/lib/message'
import Popover from 'antd/lib/popover'
import Switch from 'antd/lib/switch'

@translate(['wallet'])
@inject('gui', 'rpc', 'wallet')
@observer
class ChainBlender extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.rpc = props.rpc
    this.wallet = props.wallet
    this.toggle = this.toggle.bind(this)
  }

  /**
   * Toggle ChainBlender.
   * @function toggle
   */
  async toggle() {
    const res = await this.rpc.chainBlender(
      this.wallet.isBlending === true ? 'stop' : 'start'
    )

    if ('result' in res === true) {
      this.wallet.toggleBlendingStatus()
      message.success(
        this.t('chainBlender', {
          context: this.wallet.isBlending === true ? 'start' : 'stop'
        })
      )
    }
  }

  render() {
    return (
      <Popover
        placement="topLeft"
        trigger="click"
        title={
          <div className="flex-sb">
            <p>{this.t('toggleChainBlender')}</p>
            <Switch
              checked={this.wallet.isBlending === true}
              checkedChildren={
                <div style={{ margin: '-2px 0 0 0' }}>
                  <i className="material-icons md-16">done</i>
                </div>
              }
              disabled={this.wallet.isLocked === true}
              onChange={this.toggle}
              size="small"
              unCheckedChildren={
                <div style={{ margin: '-2px 0 0 0' }}>
                  <i className="material-icons md-16">clear</i>
                </div>
              }
            />
          </div>
        }
        content={
          <div className="flex-sb" style={{ width: '250px' }}>
            <div style={{ lineHeight: '18px' }}>
              <div className="flex">
                <i className="material-icons md-16">account_balance_wallet</i>
                <p>{this.t('balanceOnChain')}</p>
              </div>
              <div className="flex">
                <i className="material-icons md-16">shuffle</i>
                <p>
                  {this.t('blended')} (
                  {new Intl.NumberFormat(this.gui.language, {
                    maximumFractionDigits: 2
                  }).format(this.wallet.info.blendedpercentage)}
                  %)
                </p>
              </div>
              <div className="flex">
                <i className="material-icons md-16">grain</i>
                <p>{this.t('denominated')}</p>
              </div>
            </div>
            <div style={{ fontWeight: 500, lineHeight: '18px' }}>
              <p>
                {new Intl.NumberFormat(this.gui.language, {
                  maximumFractionDigits: 6,
                  minimumFractionDigits: 6
                }).format(this.wallet.info.balanceOnChain)}{' '}
                XVC
              </p>
              <p>
                {new Intl.NumberFormat(this.gui.language, {
                  maximumFractionDigits: 6,
                  minimumFractionDigits: 6
                }).format(this.wallet.info.blendedbalance)}{' '}
                XVC
              </p>
              <p>
                {new Intl.NumberFormat(this.gui.language, {
                  maximumFractionDigits: 6,
                  minimumFractionDigits: 6
                }).format(this.wallet.info.denominatedbalance)}{' '}
                XVC
              </p>
            </div>
          </div>
        }
      >
        <Button disabled={this.wallet.isLocked === true} size="small">
          <i className="flex-center material-icons md-16">shuffle</i>
        </Button>
      </Popover>
    )
  }
}

export default ChainBlender
