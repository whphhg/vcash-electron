import React from 'react'
import List from 'react-list'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'

/** Component */
import RecipientListItem from './RecipientListItem.js'

@translate(['wallet'])
@inject('gui', 'rates', 'send')
@observer
class RecipientList extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.rates = props.rates
    this.send = props.send
  }

  /**
   * Set recipient address or amount.
   * @function setRecipient
   * @param {object} e - Input element event.
   */
  setRecipient = e => {
    this.send.setRecipient(e.target.id, e.target.name, e.target.value)
  }

  render() {
    return (
      <div
        className="list-plain"
        style={{ maxHeight: this.gui.window.height - 268 }}
      >
        <List
          length={this.send.recipientsKeys.length}
          itemRenderer={(index, key) => (
            <RecipientListItem
              index={index}
              key={key}
              t={this.t}
              gui={this.gui}
              rates={this.rates}
              send={this.send}
              setRecipient={this.setRecipient}
            />
          )}
        />
      </div>
    )
  }
}

export default RecipientList
