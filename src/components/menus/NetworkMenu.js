import React from 'react'
import { translate } from 'react-i18next'
import { withRouter } from 'react-router-dom'
import { action, extendObservable } from 'mobx'
import { inject, observer } from 'mobx-react'

/** Ant Design */
import Menu from 'antd/lib/menu'

@translate(['wallet'])
@inject('connections')
@observer
class NetworkMenu extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.connections = props.connections

    /** Extend the component with observable properties. */
    extendObservable(this, {
      selected: '/' + this.connections.viewingId + '/network/info'
    })
  }

  /**
   * Set selected menu item and navigate to it.
   * @function setSelected
   * @param {object} item - Routing path and menu item key.
   */
  @action
  setSelected = ({ key }) => {
    this.selected = key

    if (this.props.history.location.pathname !== key) {
      this.props.history.push(key)
    }
  }

  render() {
    const key = '/' + this.connections.viewingId + '/network/'
    return (
      <Menu
        mode="inline"
        onClick={this.setSelected}
        selectedKeys={[this.selected]}
      >
        <Menu.Item key={key + 'info'}>
          <div className="flex">
            <i className="material-icons md-20">business</i>
            <p style={{ margin: '0 0 0 10px' }}>{this.t('netInfo')}</p>
          </div>
        </Menu.Item>
        <Menu.Item key={key + 'rewards'}>
          <div className="flex">
            <i className="material-icons md-20">star</i>
            <p style={{ margin: '0 0 0 10px' }}>{this.t('netRewards')}</p>
          </div>
        </Menu.Item>
        <Menu.Item key={key + 'rates'}>
          <div className="flex">
            <i className="material-icons md-20">network_check</i>
            <p style={{ margin: '0 0 0 10px' }}>{this.t('netRates')}</p>
          </div>
        </Menu.Item>
      </Menu>
    )
  }
}

export default withRouter(NetworkMenu)
