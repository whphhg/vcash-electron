import React from 'react'
import { observer } from 'mobx-react'
import { AutoComplete, Button, Col, Input, Popover, Row } from 'antd'

/** Make the component reactive and inject MobX stores. */
@observer(['addresses', 'keyImport', 'wallet'])

class KeyImport extends React.Component {
  constructor(props) {
    super(props)
    this.addresses = props.addresses
    this.keyImport = props.keyImport
    this.wallet = props.wallet
    this.importprivkey = this.importprivkey.bind(this)
    this.setAccount = this.setAccount.bind(this)
    this.setPrivateKey = this.setPrivateKey.bind(this)
    this.togglePopover = this.togglePopover.bind(this)
  }

  importprivkey() {
    this.keyImport.importprivkey()
  }

  setAccount(account) {
    this.keyImport.setAccount(account)
  }

  setPrivateKey(event) {
    this.keyImport.setPrivateKey(event.target.value)
  }

  togglePopover() {
    this.keyImport.togglePopover()
  }

  popoverContent() {
    return (
      <div style={{width:'400px'}}>
        <Row>
          <Col span={24}>
            <Input type='text' placeholder='Enter private key' style={{width:'100%'}} value={this.keyImport.privateKey} onChange={this.setPrivateKey} />
          </Col>
        </Row>
        <Row>
          <Col span={24} style={{marginTop:'10px'}}>
            <AutoComplete
              placeholder='Account name (optional)'
              style={{width:'296px'}}
              getPopupContainer={triggerNode => triggerNode.parentNode}
              value={this.keyImport.account}
              dataSource={this.addresses.accounts}
              onChange={this.setAccount}
            />
            <div style={{float:'right'}}>
              <Button onClick={this.importprivkey} disabled={this.keyImport.errorStatus !== false} loading={this.keyImport.loading === true}>Confirm</Button>
            </div>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            {
              this.keyImport.errorStatus === 'invalidCharacters' && (
                <p className='error-text'>You can enter only alphanumerals, dash and space.</p>
              ) ||
              this.keyImport.errorStatus === 'invalidKey' && (
                <p className='error-text'>The private key you have entered is invalid.</p>
              ) ||
              this.keyImport.errorStatus === 'isMine' && (
                <p className='error-text'>The private key you have entered belongs to your wallet.</p>
              )
            }
          </Col>
        </Row>
      </div>
    )
  }

  render() {
    return (
      <Popover trigger='click' placement='bottomLeft' title='Enter the private key you would like to import'
        visible={this.keyImport.popover === true} onVisibleChange={this.togglePopover}
        content={this.popoverContent()}
      >
        <Button disabled={this.wallet.isLocked === true}>Import private key</Button>
      </Popover>
    )
  }
}

export default KeyImport
