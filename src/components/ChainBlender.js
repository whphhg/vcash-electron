import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Switch, Tooltip, message } from 'antd'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('gui', 'info', 'rpc') @observer

export default class ChainBlender extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.info = props.info
    this.rpc = props.rpc
  }

  /**
   * Toggle ChainBlender.
   * @function toggle
   */
  toggle = () => {
    this.rpc.execute([
      {
        method: 'chainblender',
        params: [this.info.isBlending === true ? 'stop' : 'start']
      }
    ], (response) => {
      /** Handle result. */
      if (response[0].hasOwnProperty('result') === true) {
        /** Update blending status. */
        this.info.setBlendingStatus()

        /** Display a success message. */
        message.success(
          this.t('wallet:chainBlender',
            { context: this.info.isBlending === true ? 'start' : 'stop' }
          ), 6
        )
      }
    })
  }

  render () {
    return (
      <div className='flex'>
        <div style={{margin: '0 10px 3px 0'}}>
          <Tooltip
            placement='bottomLeft'
            title={this.t('wallet:toggleChainBlender')}
          >
            <Switch
              checked={this.info.isBlending === true}
              checkedChildren={
                <div style={{margin: '-2px 0 0 0'}}>
                  <i className='material-icons md-16'>done</i>
                </div>
              }
              disabled={this.info.isLocked === true}
              onChange={this.toggle}
              size='small'
              unCheckedChildren={
                <div style={{margin: '-2px 0 0 0'}}>
                  <i className='material-icons md-16'>clear</i>
                </div>
              }
            />
          </Tooltip>
        </div>
        <i className='material-icons md-16'>shuffle</i>
        <p>
          {this.t('wallet:blended')} <span style={{fontWeight: 600}}>
            {
              new Intl.NumberFormat(this.gui.language, {
                maximumFractionDigits: 6
              }).format(this.info.chainBlender.blendedbalance)
            }
          </span> XVC (<span style={{fontWeight: 600}}>
            {
              new Intl.NumberFormat(this.gui.language, {
                maximumFractionDigits: 2
              }).format(this.info.chainBlender.blendedpercentage)
            }
          </span>%)
        </p>
        {
          this.info.isLocked === false && (
            <div className='flex' style={{margin: '0 0 0 10px'}}>
              <i className='material-icons md-16'>grain</i>
              <p>
                {this.t('wallet:denominated')} <span style={{fontWeight: 600}}>
                  {
                    new Intl.NumberFormat(this.gui.language, {
                      maximumFractionDigits: 6
                    }).format(this.info.chainBlender.denominatedbalance)
                  }
                </span> XVC
              </p>
            </div>
          )
        }
      </div>
    )
  }
}
