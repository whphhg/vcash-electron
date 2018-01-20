import React from 'react'
import { translate } from 'react-i18next'
import { withRouter } from 'react-router-dom'
import { action, extendObservable } from 'mobx'
import { inject, observer } from 'mobx-react'

/** Ant Design */
import Menu from 'antd/lib/menu'

@translate(['common'])
@inject('connections')
@observer
class MaintenanceMenu extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.connections = props.connections

    /** Extend the component with observable properties. */
    extendObservable(this, {
      selected: '/' + this.connections.viewingId + '/maintenance/general'
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
    const key = '/' + this.connections.viewingId + '/maintenance/'
    return (
      <Menu
        mode="inline"
        onClick={this.setSelected}
        selectedKeys={[this.selected]}
      >
        <Menu.Item key={key + 'general'}>
          <div className="flex">
            <i className="material-icons md-20">tune</i>
            <p style={{ margin: '0 0 0 10px' }}>{this.t('maint')}</p>
          </div>
        </Menu.Item>
        <Menu.Item key={key + 'dump'}>
          <div className="flex">
            <i className="material-icons md-20">arrow_upward</i>
            <p style={{ margin: '0 0 0 10px' }}>{this.t('maintDump')}</p>
          </div>
        </Menu.Item>
        <Menu.Item key={key + 'import'}>
          <div className="flex">
            <i className="material-icons md-20">arrow_downward</i>
            <p style={{ margin: '0 0 0 10px' }}>{this.t('maintImport')}</p>
          </div>
        </Menu.Item>
        <Menu.Item key={key + 'rates'}>
          <div className="flex">
            <i className="material-icons md-20">cached</i>
            <p style={{ margin: '0 0 0 10px' }}>
              {this.t('toggleExchangeRates')}
            </p>
          </div>
        </Menu.Item>
        <Menu.Item key={key + 'console'}>
          <div className="flex">
            <i className="material-icons md-20">remove_from_queue</i>
            <p style={{ margin: '0 0 0 10px' }}>{this.t('rpcConsole')}</p>
          </div>
        </Menu.Item>
      </Menu>
    )
  }
}

export default withRouter(MaintenanceMenu)
