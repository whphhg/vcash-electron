import React from 'react'
import List from 'react-list'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'

/** Component */
import RecentBlockListItem from './RecentBlockListItem.js'

@translate(['common'])
@inject('gui', 'statistics')
@observer
class RecentBlockList extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.statistics = props.statistics
  }

  render() {
    return (
      <div>
        <div className="flex list-header">
          <p style={{ minWidth: '65px' }}>{this.t('block')}</p>
          <p style={{ minWidth: '50px' }}>{this.t('type')}</p>
          <p style={{ minWidth: '130px' }}>{this.t('age')}</p>
          <p style={{ minWidth: '80px' }}>{this.t('size')}</p>
          <p style={{ minWidth: '80px' }}>{this.t('txs')}</p>
        </div>
        <div
          className="list-plain"
          style={{ maxHeight: this.gui.window.height - 347 }}
        >
          <List
            length={this.statistics.recentBlocks.length}
            itemRenderer={(index, key) => (
              <RecentBlockListItem
                index={index}
                key={key}
                gui={this.gui}
                statistics={this.statistics}
              />
            )}
          />
        </div>
      </div>
    )
  }
}

export default RecentBlockList
