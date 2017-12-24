import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'

/** Ant Design */
import Switch from 'antd/lib/switch'

/** Component */
import { SwitchIcon } from '../utilities/Common'

@translate(['wallet'])
@inject('gui')
@observer
class SetSoundAlerts extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.toggleNotification = this.toggleNotification.bind(this)
  }

  /**
   * Toggle notification.
   * @function toggleNotification
   */
  toggleNotification(name) {
    this.gui.setSoundAlert(name)

    /** Play the sound if enabling the notification. */
    if (this.gui.soundAlerts[name] === true) this.gui.sounds[name].play()
  }

  render() {
    return (
      <div>
        <div className="flex">
          <i className="material-icons md-16">notifications_active</i>
          <p>{this.t('notificationSounds')}</p>
        </div>
        <div className="flex-sb" style={{ margin: '15px 0 5px 0' }}>
          <div className="flex">
            <i className="material-icons md-16">call_received</i>
            <p>{this.t('incoming')}</p>
          </div>
          <Switch
            checked={this.gui.soundAlerts.incoming === true}
            checkedChildren={<SwitchIcon icon="done" />}
            onChange={() => this.toggleNotification('incoming')}
            size="small"
            unCheckedChildren={<SwitchIcon icon="clear" />}
          />
        </div>
        <div className="flex-sb">
          <div className="flex">
            <i className="material-icons md-16">done_all</i>
            <p>{this.t('spendable')}</p>
          </div>
          <Switch
            checked={this.gui.soundAlerts.spendable === true}
            checkedChildren={<SwitchIcon icon="done" />}
            onChange={() => this.toggleNotification('spendable')}
            size="small"
            unCheckedChildren={<SwitchIcon icon="clear" />}
          />
        </div>
      </div>
    )
  }
}

export default SetSoundAlerts
