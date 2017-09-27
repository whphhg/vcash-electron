import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Switch } from 'antd'

/** Sound alerts setting component. */
@translate(['wallet'], { wait: true })
@inject('gui')
@observer
class SelectSoundAlerts extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
  }

  render () {
    return (
      <div>
        <div className='flex-sb'>
          <div className='flex'>
            <i className='material-icons md-16'>notifications_active</i>
            <p>{this.t('wallet:notificationSounds')}</p>
          </div>
          <div className='flex'>
            <Switch
              checked={this.gui.soundAlerts.incoming === true}
              checkedChildren={
                <div style={{ margin: '-2px 0 0 0' }}>
                  <i className='material-icons md-16'>done</i>
                </div>
              }
              onChange={() => this.gui.setSoundAlert('incoming')}
              size='small'
              unCheckedChildren={
                <div style={{ margin: '-2px 0 0 0' }}>
                  <i className='material-icons md-16'>clear</i>
                </div>
              }
            />
            <div className='flex' style={{ margin: '0 20px 0 8px' }}>
              <i className='material-icons md-16'>call_received</i>
              <p>{this.t('wallet:incoming')}</p>
            </div>
            <Switch
              checked={this.gui.soundAlerts.spendable === true}
              checkedChildren={
                <div style={{ margin: '-2px 0 0 0' }}>
                  <i className='material-icons md-16'>done</i>
                </div>
              }
              onChange={() => this.gui.setSoundAlert('spendable')}
              size='small'
              unCheckedChildren={
                <div style={{ margin: '-2px 0 0 0' }}>
                  <i className='material-icons md-16'>clear</i>
                </div>
              }
            />
            <div className='flex' style={{ margin: '0 0 0 8px' }}>
              <i className='material-icons md-16'>done_all</i>
              <p>{this.t('wallet:spendable')}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default SelectSoundAlerts
