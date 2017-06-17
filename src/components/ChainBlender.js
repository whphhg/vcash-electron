import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Switch, Tooltip, message } from 'antd'

@translate(['wallet'], { wait: true })
@inject('gui', 'rpc', 'wallet')
@observer
class ChainBlender extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.rpc = props.rpc
    this.wallet = props.wallet
  }

  /**
   * Toggle ChainBlender.
   * @function toggle
   */
  toggle = () => {
    this.rpc.execute(
      [
        {
          method: 'chainblender',
          params: [this.wallet.isBlending === true ? 'stop' : 'start']
        }
      ],
      response => {
        /** Update blending status & display a success message. */
        if (response[0].hasOwnProperty('result') === true) {
          this.wallet.setBlendingStatus()
          message.success(
            this.t('wallet:chainBlender', {
              context: this.wallet.isBlending === true ? 'start' : 'stop'
            }),
            6
          )
        }
      }
    )
  }

  render () {
    const {
      blendedbalance,
      blendedpercentage,
      denominatedbalance
    } = this.wallet.info.chainblender

    return (
      <div className='flex'>
        <div style={{ margin: '0 10px 3px 0' }}>
          <Tooltip
            placement='bottomLeft'
            title={this.t('wallet:toggleChainBlender')}
          >
            <Switch
              checked={this.wallet.isBlending === true}
              checkedChildren={
                <div style={{ margin: '-2px 0 0 0' }}>
                  <i className='material-icons md-16'>done</i>
                </div>
              }
              disabled={this.wallet.isLocked === true}
              onChange={this.toggle}
              size='small'
              unCheckedChildren={
                <div style={{ margin: '-2px 0 0 0' }}>
                  <i className='material-icons md-16'>clear</i>
                </div>
              }
            />
          </Tooltip>
        </div>
        <i className='material-icons md-16'>shuffle</i>
        <p>
          {this.t('wallet:blended')}{' '}
          <span style={{ fontWeight: 600 }}>
            {new Intl.NumberFormat(this.gui.language, {
              maximumFractionDigits: 6
            }).format(blendedbalance)}
          </span>{' '}
          XVC (<span style={{ fontWeight: 600 }}>
            {new Intl.NumberFormat(this.gui.language, {
              maximumFractionDigits: 2
            }).format(blendedpercentage)}
          </span>%)
        </p>
        {this.wallet.isLocked === false &&
          <div className='flex' style={{ margin: '0 0 0 10px' }}>
            <i className='material-icons md-16'>grain</i>
            <p>
              {this.t('wallet:denominated')}{' '}
              <span style={{ fontWeight: 600 }}>
                {new Intl.NumberFormat(this.gui.language, {
                  maximumFractionDigits: 6
                }).format(denominatedbalance)}
              </span>{' '}
              XVC
            </p>
          </div>}
      </div>
    )
  }
}

export default ChainBlender
