import React from 'react'
import { inject, observer } from 'mobx-react'
import { Col, Row } from 'antd'

/** Required components. */
import AddressesTable from './AddressesTable'
import AddressNew from './AddressNew'
import KeyDump from './KeyDump'
import KeyImport from './KeyImport'
import SendControls from './SendControls'
import SendOptions from './SendOptions'
import SendRecipient from './SendRecipient'

/** Make the component reactive and inject MobX stores. */
@inject('send', 'wallet') @observer

class Addresses extends React.Component {
  constructor (props) {
    super(props)
    this.send = props.send
    this.wallet = props.wallet
  }

  render () {
    return (
      <div>
        <Row>
          <Col span={24} className='shadow'>
            <Row>
              <Col span={11}>
                <div className='toolbar'>
                  <AddressNew />
                  <KeyImport />
                  <KeyDump />
                </div>
              </Col>
              <Col span={13}>
                <div className='toolbar'>
                  <SendControls />
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row>
          <Col span={11}>
            <div style={{margin: '10px'}}>
              <AddressesTable />
            </div>
          </Col>
          <Col span={13}>
            <div style={{margin: '10px'}}>
              <div id='sendRecipients'>
                {
                  this.send.recipients.entries().map((recipient) => (
                    <SendRecipient
                      data={recipient[1]}
                      key={recipient[1].uid}
                    />
                  ))
                }
              </div>
              <hr id='send' />
              <SendOptions />
            </div>
          </Col>
        </Row>
      </div>
    )
  }
}

export default Addresses
