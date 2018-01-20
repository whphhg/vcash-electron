import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { join } from 'path'
import moment from 'moment'

/** Ant Design */
import Button from 'antd/lib/button'
import Switch from 'antd/lib/switch'
import Tooltip from 'antd/lib/tooltip'

/** Component */
import { SwitchIcon } from '../utilities/Common.js'

@translate(['common'])
@inject('gui', 'rates')
@observer
class SetRates extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.rates = props.rates
  }

  render() {
    const imgDir = join(__dirname, '..', '..', 'assets', 'images')
    return (
      <div>
        <div className="flex-sb" style={{ alignItems: 'flex-start' }}>
          <div style={{ flex: 0.5, margin: '0 25px 0 0' }}>
            <div className="flex">
              <i className="material-icons md-16">swap_horiz</i>
              <p style={{ fontWeight: '500' }}>{this.t('exchanges')}</p>
            </div>
            <hr />
            <div>
              <div className="flex-sb" style={{ margin: '0 0 5px 0' }}>
                <div className="flex">
                  <img src={join(imgDir, 'exchangeBittrex.png')} />
                  <p style={{ margin: '0 0 0 5px' }}>Bittrex</p>
                </div>
                <div className="flex">
                  <Tooltip
                    placement="left"
                    title={
                      this.rates.bittrex.updated > 0
                        ? ''.concat(
                            this.t('lastUpdated'),
                            ' ',
                            moment(this.rates.bittrex.updated).format('LTS')
                          )
                        : this.t('exchangeDisabled')
                    }
                  >
                    <p style={{ margin: '0 15px 0 0' }}>
                      <span style={{ fontWeight: '500' }}>
                        {new Intl.NumberFormat(this.gui.language, {
                          minimumFractionDigits: 8,
                          maximumFractionDigits: 8
                        }).format(this.rates.bittrex.Last)}
                      </span>{' '}
                      BTC
                    </p>
                  </Tooltip>
                  <Switch
                    checked={this.rates.exchanges.bittrex === true}
                    checkedChildren={<SwitchIcon icon="done" />}
                    onChange={() => this.rates.setExchange('bittrex')}
                    size="small"
                    unCheckedChildren={<SwitchIcon icon="clear" />}
                  />
                </div>
              </div>
              <div className="flex-sb">
                <div className="flex">
                  <img src={join(imgDir, 'exchangePoloniex.png')} />
                  <p style={{ margin: '0 0 0 5px' }}>Poloniex</p>
                </div>
                <div className="flex">
                  <Tooltip
                    placement="left"
                    title={
                      this.rates.poloniex.updated > 0
                        ? ''.concat(
                            this.t('lastUpdated'),
                            ' ',
                            moment(this.rates.poloniex.updated).format('LTS')
                          )
                        : this.t('exchangeDisabled')
                    }
                  >
                    <p style={{ margin: '0 15px 0 0' }}>
                      <span style={{ fontWeight: '500' }}>
                        {new Intl.NumberFormat(this.gui.language, {
                          minimumFractionDigits: 8,
                          maximumFractionDigits: 8
                        }).format(this.rates.poloniex.last)}
                      </span>{' '}
                      BTC
                    </p>
                  </Tooltip>
                  <Switch
                    checked={this.rates.exchanges.poloniex === true}
                    checkedChildren={<SwitchIcon icon="done" />}
                    onChange={() => this.rates.setExchange('poloniex')}
                    size="small"
                    unCheckedChildren={<SwitchIcon icon="clear" />}
                  />
                </div>
              </div>
            </div>
          </div>
          <div style={{ flex: 0.5, margin: '0 0 0 24px' }}>
            <div className="flex" style={{ fontWeight: '500' }}>
              <i className="material-icons md-16">monetization_on</i>
              <p>{this.t('bitcoinAverage')}</p>
            </div>
            <hr />
            <div className="flex-sb" style={{ alignItems: 'flex-end' }}>
              <div>
                <p>
                  {this.rates.localCurrencies.length} {this.t('currencies')}
                </p>
                <p style={{ margin: '5px 10px 0 0' }}>
                  {this.t('lastUpdated')}{' '}
                  {moment(this.rates.bitcoinAverage.updated).format('LTS')}
                </p>
              </div>
              <div>
                <Button
                  onClick={() => this.rates.fetchBitcoinAverage(true)}
                  size="small"
                  type="dashed"
                >
                  {this.t('manualRefresh')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default SetRates
