import React from 'react'
import { inject, observer } from 'mobx-react'
import { AutoComplete, Button, Col, Popover, Row } from 'antd'

/** Make the component reactive and inject MobX stores. */
@observer(['addresses', 'addressNew'])

class AddressNew extends React.Component {
  constructor(props) {
    super(props)
    this.addresses = props.addresses
    this.addressNew = props.addressNew
    this.getnewaddress = this.getnewaddress.bind(this)
    this.setAccount = this.setAccount.bind(this)
    this.togglePopover = this.togglePopover.bind(this)
  }

  getnewaddress() {
    this.addressNew.getnewaddress()
  }

  setAccount(account, label) {
    this.addressNew.setAccount(account)
  }

  togglePopover() {
    this.addressNew.togglePopover()
  }

  popoverContent() {
    return (
      <div style={{width:'300px'}}>
        <Row>
          <Col span={24}>
            <AutoComplete
              placeholder='Account name (optional)'
              style={{width:'215px', marginRight:'10px'}}
              getPopupContainer={triggerNode => triggerNode.parentNode}
              value={this.addressNew.account}
              dataSource={this.addresses.accounts}
              onChange={this.setAccount}
            />
            <Button onClick={this.getnewaddress} disabled={this.addressNew.errorStatus !== false}>Confirm</Button>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
          {
            this.addressNew.errorStatus === 'invalidCharacters' && (
              <p className='error-text'>You can only enter alphanumerals, dash and space.</p>
            ) ||
            this.addressNew.errorStatus === 'keypoolRanOut' && (
              <p className='error-text'>Keypool ran out.</p>
            )
          }
          </Col>
        </Row>
      </div>
    )
  }

  render() {
    return (
      <Popover
        title='Generate new address'
        trigger='click'
        placement='bottomLeft'
        content={this.popoverContent()}
        visible={this.addressNew.popover === true}
        onVisibleChange={this.togglePopover}
      >
        <Button>New address</Button>
      </Popover>
    )
  }
}

export default AddressNew
