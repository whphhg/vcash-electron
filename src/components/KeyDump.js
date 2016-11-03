import React from 'react'
import { inject, observer } from 'mobx-react'
import { AutoComplete, Button, Col, Popover, Row } from 'antd'

/** Make the component reactive and inject MobX stores. */
@observer(['addresses', 'keyDump', 'wallet'])

class KeyDump extends React.Component {
  constructor(props) {
    super(props)
    this.addresses = props.addresses
    this.keyDump = props.keyDump
    this.wallet = props.wallet
    this.dumpprivkey = this.dumpprivkey.bind(this)
    this.setAddress = this.setAddress.bind(this)
    this.togglePopover = this.togglePopover.bind(this)
  }

  dumpprivkey() {
    this.keyDump.dumpprivkey()
  }

  setAddress(address) {
    this.keyDump.setAddress(address)
  }

  togglePopover() {
    this.keyDump.togglePopover()
  }

  popoverContent() {
    return (
      <div style={{width:'400px'}}>
        <Row>
          <Col span={24}>
            <AutoComplete
              placeholder='Enter address'
              style={{width:'315px', marginRight:'10px'}}
              getPopupContainer={triggerNode => triggerNode.parentNode}
              value={this.keyDump.address}
              dataSource={this.addresses.list}
              onChange={this.setAddress}
            />
            <Button onClick={this.dumpprivkey} disabled={this.keyDump.errorStatus !== false}>Confirm</Button>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            {
              this.keyDump.errorStatus === 'unknownAddress' && (
                <p className='error-text'>The address you have entered does not belong to your wallet.</p>
              ) ||
              this.keyDump.errorStatus === 'invalidAddress' && (
                <p className='error-text'>The address you have entered is not valid. Please double-check it.</p>
              ) ||
              this.keyDump.errorStatus === 'invalidCharacters' && (
                <p className='error-text'>The address you have entered contains invalid characters.</p>
              ) ||
              this.keyDump.privateKey !== '' && (
                <div style={{marginTop:'10px'}}>
                  <p><i className='material-icons md-20'>vpn_key</i>
                    <span className='input-label'>
                      <span className='font-weight-500'>{this.keyDump.privateKey}</span>
                    </span>
                  </p>
                </div>
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
        title='Enter the address you would like to dump'
        trigger='click'
        placement='bottomLeft'
        content={this.popoverContent()}
        visible={this.keyDump.popover === true}
        onVisibleChange={this.togglePopover}
      >
        <Button disabled={this.wallet.isLocked === true}>Dump private key</Button>
      </Popover>
    )
  }
}

export default KeyDump
