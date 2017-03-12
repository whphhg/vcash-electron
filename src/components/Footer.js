import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('info', 'ui') @observer

export default class Footer extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.info = props.info
    this.ui = props.ui
  }

  render () {
    return (
      <footer className='shadow'>
        <div style={{float: 'left'}}>
          <i className='material-icons md-16'>extension</i>
          <p>
            {this.t('wallet:onBlock')}
            <span> {
              new Intl.NumberFormat(this.ui.language)
                .format(this.info.wallet.blocks)
              }
            </span>
          </p>
          <i className='material-icons md-16'>settings_input_antenna</i>
          <p>
            <span>{this.info.network.tcp} TCP </span>
            {this.t('wallet:and')}
            <span> {this.info.network.udp} UDP </span>
            {this.t('wallet:connections')}
          </p>
        </div>
        <div
          style={{
            float: 'right',
            margin: '0 10px 0 0'
          }}
        >
          <img
            src='./assets/images/logoGrey.png'
            style={{
              width: '15px',
              height: '15px',
              margin: '0 5px 0 0'
            }}
          />
          <p>
            Vcash
            <span> {this.info.wallet.version.split(':')[1]}</span>
          </p>
          <i className='material-icons md-16'>account_balance_wallet</i>
          <p>
            {this.t('wallet:wallet')}
            <span> {this.info.wallet.walletversion}</span>
          </p>
          <i className='material-icons md-16'>computer</i>
          <p>
            UI
            <span> {process.env.npm_package_version}</span>
          </p>
        </div>
      </footer>
    )
  }
}
