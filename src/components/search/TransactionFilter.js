import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'

/** Ant Design */
import Button from 'antd/lib/button'
import Popover from 'antd/lib/popover'
import Switch from 'antd/lib/switch'

@translate(['wallet'])
@inject('search')
@observer
class TransactionFilter extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.search = props.search
  }

  /**
   * Switch icon.
   * @function switchIcon
   * @param {string} name - Material icon name.
   */
  switchIcon(name) {
    return (
      <div style={{ margin: '-2px 0 0 0' }}>
        <i className="material-icons md-16">{name}</i>
      </div>
    )
  }

  /**
   * Switch toggle.
   * @function switchToggle
   * @param {string} name - Name of the property to toggle in the search store.
   */
  switchToggle(name) {
    return (
      <Switch
        checked={this.search.show.tx[name]}
        checkedChildren={this.switchIcon('done')}
        onChange={() => this.search.toggleShow('tx', name)}
        size="small"
        unCheckedChildren={this.switchIcon('clear')}
      />
    )
  }

  render() {
    return (
      <Popover
        placement="bottom"
        trigger="click"
        title={
          <div className="flex">
            <i className="material-icons md-16">filter_list</i>
            <p>{this.t('txFilter')}</p>
          </div>
        }
        content={
          <div className="flex-sb">
            <div>
              <p>{this.t('received')}</p>
              <p>{this.t('sent')}</p>
              <p>{this.t('sentSelf')}</p>
              <p>{this.t('blended')}</p>
              <p>{this.t('rewards')}</p>
            </div>
            <div>
              <div>{this.switchToggle('received')}</div>
              <div>{this.switchToggle('sent')}</div>
              <div>{this.switchToggle('sentSelf')}</div>
              <div>{this.switchToggle('blended')}</div>
              <div>{this.switchToggle('rewards')}</div>
            </div>
          </div>
        }
      >
        <Button size="small">
          <i className="material-icons md-16">filter_list</i>
        </Button>
      </Popover>
    )
  }
}

export default TransactionFilter
