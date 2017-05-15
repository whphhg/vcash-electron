import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Progress } from 'antd'
import { version } from '../../package.json'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('connections', 'gui', 'wallet') @observer

export default class Footer extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.connections = props.connections
    this.gui = props.gui
    this.wallet = props.wallet
  }

  render () {
    return (
      <div className='shadow'>
        <div style={{margin: '0 10px 0 10px'}}>
          <div className='flex-sb' style={{height: '25px'}}>
            <div className='flex'>
              <i className='material-icons md-16'>extension</i>
              <p style={{margin: '0 10px 0 5px'}}>
                {this.t('wallet:onBlock')} <span style={{fontWeight: '500'}}>
                  {
                    new Intl.NumberFormat(this.gui.language)
                      .format(this.wallet.info.getinfo.blocks)
                  }
                </span>
              </p>
              {
                this.wallet.syncPercent < 100 && (
                  <div className='flex'>
                    <div style={{width: '90px'}}>
                      <Progress
                        percent={this.wallet.syncPercent}
                        showInfo={false}
                        status='active'
                        strokeWidth={5}
                      />
                    </div>
                    <p style={{margin: '0 10px 0 10px'}}>
                      {
                        new Intl.NumberFormat(this.gui.language, {
                          maximumFractionDigits: 2
                        }).format(this.wallet.syncPercent)
                      }%
                    </p>
                  </div>
                )
              }
              <i className='material-icons md-16'>settings_input_antenna</i>
              <p style={{margin: '0 10px 0 5px'}}>
                <span style={{fontWeight: '500'}}>
                  {this.wallet.info.getnetworkinfo.tcp.connections}
                </span> TCP &bull; <span style={{fontWeight: '500'}}>
                  {this.wallet.info.getnetworkinfo.udp.connections}
                </span> UDP
              </p>
              <i className='material-icons md-16'>cast_connected</i>
              <p>
                <a onClick={() => this.connections.toggleModal()}>
                  {this.t('wallet:connectionManager')}
                </a>
              </p>
            </div>
            <div className='flex'>
              <img
                src='./assets/images/logoGrey.png'
                style={{height: '15px', width: '15px'}}
              />
              <p style={{margin: '0 10px 0 5px'}}>
                Vcash <span style={{fontWeight: '500'}}>
                  {this.wallet.info.getinfo.version.split(':')[1]}
                </span>
              </p>
              <i className='material-icons md-16'>account_balance_wallet</i>
              <p style={{margin: '0 10px 0 5px'}}>
                {this.t('wallet:wallet')} <span style={{fontWeight: '500'}}>
                  {this.wallet.info.getinfo.walletversion}
                </span>
              </p>
              <i className='material-icons md-16'>computer</i>
              <p>GUI <span style={{fontWeight: '500'}}>{version}</span></p>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
