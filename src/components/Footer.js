import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { join } from 'path'
import { version } from '../../package.json'

/** Ant Design */
import Progress from 'antd/lib/progress'

@translate(['common'])
@inject('connections', 'gui', 'wallet')
@observer
class Footer extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.connections = props.connections
    this.gui = props.gui
    this.wallet = props.wallet
  }

  render() {
    return (
      <div className="flex-sb" id="Footer">
        <div className="flex">
          <i className="material-icons md-16">extension</i>
          <p style={{ margin: '0 15px 0 5px' }}>
            {this.t('onBlock')}{' '}
            <span style={{ fontWeight: '500' }}>
              {new Intl.NumberFormat(this.gui.language).format(
                this.wallet.info.blocks
              )}
            </span>
          </p>
          {this.wallet.syncPercent < 100 && (
            <div className="flex">
              <div style={{ width: '90px' }}>
                <Progress
                  percent={this.wallet.syncPercent}
                  showInfo={false}
                  status="active"
                  strokeWidth={5}
                />
              </div>
              <p style={{ margin: '0 15px 0 10px' }}>
                {new Intl.NumberFormat(this.gui.language, {
                  maximumFractionDigits: 2
                }).format(this.wallet.syncPercent)}%
              </p>
            </div>
          )}
          <i className="material-icons md-16">settings_input_antenna</i>
          <p style={{ margin: '0 0 0 5px' }}>
            <span style={{ fontWeight: '500' }}>
              {this.wallet.info.tcp.connections}
            </span>{' '}
            TCP &bull;{' '}
            <span style={{ fontWeight: '500' }}>
              {this.wallet.info.udp.connections}
            </span>{' '}
            UDP
          </p>
        </div>
        <div className="flex">
          <img
            src={join(__dirname, '..', 'assets', 'images', 'logoGrey.png')}
            style={{ height: '14px', width: '14px' }}
          />
          <p style={{ margin: '0 15px 0 5px' }}>
            Vcash{' '}
            <span style={{ fontWeight: '500' }}>
              {this.wallet.info.version.split(':')[1]}
            </span>
          </p>
          <i className="material-icons md-16">computer</i>
          <p>
            GUI <span style={{ fontWeight: '500' }}>{version}</span>
          </p>
        </div>
      </div>
    )
  }
}

export default Footer
