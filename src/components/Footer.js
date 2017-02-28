import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('network', 'wallet') @observer

export default class Footer extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.network = props.network
    this.wallet = props.wallet
  }

  render () {
    return (
      <footer className='shadow'>
        <i className='material-icons md-16'>extension</i>
        <p>
          {this.t('wallet:onBlock')}
          <span> {this.wallet.info.blocks}</span>
        </p>
        <i className='material-icons md-16'>settings_input_antenna</i>
        <p>
          <span>{this.network.tcp} TCP </span>
          {this.t('wallet:and')}
          <span> {this.network.udp} UDP </span>
          {this.t('wallet:connections')}
        </p>
        <p className='right'>
          UI <span>{process.env.npm_package_version}</span>
        </p>
        <p className='right'>
          {this.t('wallet:wallet')}
          <span> {this.wallet.info.walletversion}</span>
        </p>
        <p className='right'>
          Vcash
          <span> {this.wallet.info.version.split(':')[1]}</span>
        </p>
      </footer>
    )
  }
}
