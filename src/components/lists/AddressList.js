import React from 'react'
import List from 'react-list'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'

/** Component */
import AddressListItem from './AddressListItem.js'

@translate(['common'])
@inject('gui', 'search', 'wallet')
@observer
class AddressList extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.search = props.search
    this.wallet = props.wallet
  }

  render() {
    return (
      <div className="list" style={{ maxHeight: this.gui.window.height - 87 }}>
        <List
          length={this.search.addr.length}
          itemRenderer={(index, key) => (
            <AddressListItem
              index={index}
              key={key}
              t={this.t}
              gui={this.gui}
              search={this.search}
              wallet={this.wallet}
            />
          )}
        />
      </div>
    )
  }
}

export default AddressList
