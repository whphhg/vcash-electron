import React from 'react'
import { observer } from 'mobx-react'
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
              style={{width:'100%'}}
              getPopupContainer={triggerNode => triggerNode.parentNode}
              value={this.addressNew.account}
              dataSource={this.addresses.accounts}
              onChange={this.setAccount}
            />
            {
              this.addressNew.errorStatus === 'invalidCharacters' && (
                <p className='text-error'>You can only enter alphanumerals, dash and space.</p>
              ) ||
              this.addressNew.errorStatus === 'keypoolRanOut' && (
                <p className='text-error'>Keypool ran out.</p>
              )
            }
          </Col>
        </Row>
        <Row>
          <Col span={24} style={{textAlign:'right',marginTop:'3px'}}>
            <Button onClick={this.getnewaddress} disabled={this.addressNew.errorStatus !== false}>Generate new address</Button>
          </Col>
        </Row>
        {
          this.addressNew.address !== '' && (
            <div style={{margin:'8px -16px 0 -16px',borderTop:'1px solid #e9e9e9'}}>
              <Row style={{padding:'0 16px 0 16px'}}>
                <Col span={24}>
                  <div style={{marginTop:'10px'}}>
                    <p><i className='material-icons md-20'>account_balance</i>
                      <span className='input-label'>
                        <span className='text-dotted'>{this.addressNew.address}</span>
                      </span>
                    </p>
                  </div>
                </Col>
              </Row>
            </div>
          )
        }
      </div>
    )
  }

  render() {
    return (
      <Popover
        title='Generate a new receiving address'
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
