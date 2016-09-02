import React from 'react'
import { inject, observer } from 'mobx-react'

import AutoComplete from 'material-ui/AutoComplete'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import KeyIcon from 'material-ui/svg-icons/communication/vpn-key'

@inject('addressBook')
@inject('keyDump')
@observer

class KeyDump extends React.Component {
  constructor(props) {
    super(props)
    this.addressBook = props.addressBook
    this.keyDump = props.keyDump

    this.dumpprivkey = this.dumpprivkey.bind(this)
    this.setAddress = this.setAddress.bind(this)
    this.toggleDialog = this.toggleDialog.bind(this)
  }

  dumpprivkey() {
    this.keyDump.dumpprivkey()
  }

  setAddress(address) {
    this.keyDump.setAddress(address)
  }

  toggleDialog() {
    this.keyDump.toggleDialog()
  }

  render() {
    return (
      <div>
        <Dialog
          title='Dump private key'
          actions={[
            <FlatButton label='Close' onTouchTap={this.toggleDialog} />,
            <FlatButton label='Dump private key' onTouchTap={this.dumpprivkey} disabled={this.keyDump.button === false} primary={true} />
          ]}
          modal={true}
          autoScrollBodyContent={true}
          open={this.keyDump.dialog}
        >
          <AutoComplete
            onNewRequest={this.setAddress}
            onUpdateInput={this.setAddress}
            searchText={this.keyDump.address}
            errorText={
              this.keyDump.errors.doesntBelong && 'The address you have entered does not belong to your wallet.'
              || this.keyDump.errors.invalidAddress && 'The address you have entered is not valid. Please double-check it.'
            }
            floatingLabelText='Address'
            filter={AutoComplete.fuzzyFilter}
            maxSearchResults={5}
            openOnFocus={true}
            dataSource={this.addressBook.addressList}
            fullWidth={true}
          />

          {
            this.keyDump.privateKey !== '' &&
            (
              <div style={{fontSize:'14px', marginTop:'15px'}}>
                <KeyIcon style={{height:'20px', float:'left'}} />
                <p style={{float:'left', paddingLeft:'8px'}}>Dumped private key <span className='font-weight-500'>{this.keyDump.privateKey}</span></p>
                <div style={{clear:'both'}}></div>
              </div>
            )
          }
        </Dialog>
      </div>
    )
  }
}

export default KeyDump
