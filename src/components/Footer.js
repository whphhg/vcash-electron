import React from 'react'
import { inject, observer } from 'mobx-react'

/** Make the component reactive and inject MobX stores. */
@inject('network', 'wallet') @observer

class Footer extends React.Component {
  constructor(props) {
    super(props)
    this.network = props.network
    this.wallet = props.wallet
  }

  render() {
    return (
      <footer className='shadow'>
        <i className='material-icons md-16'>extension</i>
        <p>On block <span>{this.wallet.info.blocks}</span></p>
        <i className='material-icons md-16'>settings_input_antenna</i>
        <p><span>{this.network.tcp} TCP</span> and <span>{this.network.udp} UDP</span> connections</p>
        <p className='right'>UI <span>{process.env.npm_package_version}</span></p>
        <p className='right'>Wallet <span>{this.wallet.info.walletversion}</span></p>
        <p className='right'>Vcash <span>{this.wallet.info.version.split(':')[1]}</span></p>
      </footer>
    )
  }
}

export default Footer
