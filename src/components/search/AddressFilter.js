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
class AddressFilter extends React.Component {
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
        checked={this.search.show.addr[name]}
        checkedChildren={this.switchIcon('done')}
        onChange={() => this.search.toggleShow('addr', name)}
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
            <p>{this.t('addrFilter')}</p>
          </div>
        }
        content={
          <div className="flex-sb">
            <div>
              <p>{this.t('new')}</p>
              <p>{this.t('spendable')}</p>
              <p>{this.t('spent')}</p>
            </div>
            <div>
              <div>{this.switchToggle('new')}</div>
              <div>{this.switchToggle('spendable')}</div>
              <div>{this.switchToggle('spent')}</div>
            </div>
          </div>
        }
      >
        <Button size="small">
          <i className="flex-center material-icons md-16">filter_list</i>
        </Button>
      </Popover>
    )
  }
}

export default AddressFilter
