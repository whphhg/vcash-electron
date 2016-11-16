import React from 'react'
import { observer } from 'mobx-react'
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
              placeholder='Address'
              style={{width:'100%'}}
              getPopupContainer={triggerNode => triggerNode.parentNode}
              value={this.keyDump.address}
              dataSource={this.addresses.list}
              onChange={this.setAddress}
            />
            {
              this.keyDump.errorStatus === 'invalidCharacters' && (
                <p className='text-error'>The address you have entered contains invalid characters.</p>
              ) ||
              this.keyDump.errorStatus === 'unknownAddress' && (
                <p className='text-error'>The address you have entered does not belong to your wallet.</p>
              ) ||
              this.keyDump.errorStatus === 'invalidAddress' && (
                <p className='text-error'>The address you have entered is not valid. Please double-check it.</p>
              )
            }
          </Col>
        </Row>
        <Row>
          <Col span={24} style={{textAlign:'right',marginTop:'3px'}}>
            <Button onClick={this.dumpprivkey} disabled={this.keyDump.errorStatus !== false}>Dump the private key</Button>
          </Col>
        </Row>
        {
          this.keyDump.privateKey !== '' && (
            <div style={{margin:'8px -16px 0 -16px',borderTop:'1px solid #e9e9e9'}}>
              <Row style={{padding:'0 16px 0 16px'}}>
                <Col span={24}>
                  <div style={{marginTop:'10px'}}>
                    <p><i className='material-icons md-20'>vpn_key</i>
                      <span className='input-label'>
                        <span className='text-dotted'>{this.keyDump.privateKey}</span>
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
