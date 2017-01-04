import React from 'react'
import { inject, observer } from 'mobx-react'

/** Required components. */
import SendRecipient from './SendRecipient'

/** Make the component reactive and inject MobX stores. */
@inject('send') @observer

class SendRecipients extends React.Component {
  constructor (props) {
    super(props)
    this.send = props.send
  }

  render () {
    return (
      <div id='sendRecipients'>
        {
          this.send.recipients.entries().map((recipient) => (
            <SendRecipient data={recipient[1]} key={recipient[1].uid} />
          ))
        }
      </div>
    )
  }
}

export default SendRecipients
