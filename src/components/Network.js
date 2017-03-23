import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Col, Row } from 'antd'
import { humanReadable } from '../utilities/common'

/** Required components. */
import RewardCalculator from './RewardCalculator'
import { Difficulties, HashRate, RewardSpread, RewardsPerDay } from './charts'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('info', 'ui') @observer

export default class Network extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.info = props.info
    this.ui = props.ui
  }

  render () {
    return (
      <div>
        <Row>
          <Col span={24} className='shadow'>
            <div className='toolbar'>
              <div style={{float: 'left'}}>
                <i className='material-icons md-20'>redeem</i>
                <p>
                  {this.t('wallet:collateralBalance')}
                  <span> {
                      new Intl.NumberFormat(this.ui.language, {
                        maximumFractionDigits: 6
                      }).format(this.info.incentive.collateralbalance)
                    } / {
                      new Intl.NumberFormat(this.ui.language)
                        .format(this.info.incentive.collateralrequired)
                    }
                  </span> XVC
                </p>
                <i className='material-icons md-20'>gavel</i>
                <p>
                  {this.t('wallet:voteCandidate')}
                  <span> {
                    this.info.incentive.votecandidate === true
                      ? this.t('wallet:yes')
                      : this.t('wallet:no')
                    }
                  </span>
                </p>
              </div>
              <div style={{float: 'right'}}>
                <i className='material-icons md-20'>account_circle</i>
                <p>
                  {this.t('wallet:defaultAddress')}
                  <span> {
                    this.info.incentive.walletaddress === ''
                      ? this.t('wallet:unlockRevealed')
                      : this.info.incentive.walletaddress
                    }
                  </span>
                </p>
              </div>
            </div>
          </Col>
        </Row>
        <Row
          className='shadow'
          style={{
            minHeight: '478px',
            margin: '0 0 10px 0'
          }}
        >
          <Col span={12}>
            <div style={{margin: '10px 10px 0 10px'}}>
              <Row>
                <Col span={1}>
                  <i className='material-icons md-18'>timeline</i>
                </Col>
                <Col span={10}>
                  {this.t('wallet:rewardSpread')}
                </Col>
              </Row>
              <RewardSpread />
              <Row>
                <Col span={1}>
                  <i className='material-icons md-18'>view_week</i>
                </Col>
                <Col span={10}>
                  {this.t('wallet:rewardsPerDay')}
                </Col>
              </Row>
              <RewardsPerDay />
            </div>
          </Col>
          <Col span={12}>
            <div style={{margin: '10px 10px 0 10px'}}>
              <Row>
                <Col span={1}>
                  <i className='material-icons md-18'>trending_up</i>
                </Col>
                <Col span={10}>
                  {this.t('wallet:difficulties')}
                </Col>
              </Row>
              <Difficulties />
              <Row>
                <Col span={1}>
                  <i className='material-icons md-18'>network_check</i>
                </Col>
                <Col span={10}>
                  {this.t('wallet:hashRate')}
                </Col>
              </Row>
              <HashRate />
            </div>
          </Col>
        </Row>
        <Row style={{margin: '0 10px 10px 10px'}}>
          <Col span={10}>
            <RewardCalculator />
          </Col>
          <Col span={14}>
            <Row>
              <Col span={12}>
                <Row>
                  <Col span={2}>
                    <i className='material-icons md-18'>hearing</i>
                  </Col>
                  <Col span={11}>
                    {this.t('wallet:listeningOn')}
                  </Col>
                  <Col span={11}>
                    <span style={{fontWeight: '500'}}>
                      {this.info.wallet.ip}:{this.info.wallet.port}
                    </span>
                  </Col>
                </Row>
                <Row>
                  <Col span={2}>
                    <i className='material-icons md-18'>settings_ethernet</i>
                  </Col>
                  <Col span={11}>
                    {this.t('wallet:portOpen')}
                  </Col>
                  <Col span={11}>
                    <span style={{fontWeight: '500'}}>
                      {
                        this.info.incentive.networkstatus === 'ok'
                          ? this.t('wallet:yes')
                          : this.t('wallet:no')
                      }
                    </span>
                  </Col>
                </Row>
                <Row>
                  <Col span={2}>
                    <i className='material-icons md-18'>event_seat</i>
                  </Col>
                  <Col span={11}>
                    {this.t('wallet:collateralizedNodes')}
                  </Col>
                  <Col span={11}>
                    <span style={{fontWeight: '500'}}>
                      {this.info.network.collateralized + ' / '}
                      {this.info.network.endpoints.length}
                    </span>
                  </Col>
                </Row>
                <Row>
                  <Col span={2}>
                    <i className='material-icons md-18'>games</i>
                  </Col>
                  <Col span={11}>
                    {this.t('wallet:testnet')}
                  </Col>
                  <Col span={11}>
                    <span style={{fontWeight: '500'}}>
                      {
                        this.info.mining.testnet === true
                          ? this.t('wallet:yes')
                          : this.t('wallet:no')
                      }
                    </span>
                  </Col>
                </Row>
              </Col>
              <Col span={12}>
                <Row>
                  <Col span={2} offset={1}>
                    <i className='material-icons md-18'>account_balance</i>
                  </Col>
                  <Col span={11}>
                    {this.t('wallet:moneySupply')}
                  </Col>
                  <Col span={10}>
                    <span style={{fontWeight: '500'}}>
                      {
                        new Intl.NumberFormat(this.ui.language, {
                          maximumFractionDigits: 0
                        }).format(this.info.wallet.moneysupply)
                      }
                    </span> XVC
                  </Col>
                </Row>
                <Row>
                  <Col span={2} offset={1}>
                    <i className='material-icons md-18'>grid_on</i>
                  </Col>
                  <Col span={11}>
                    {this.t('wallet:currentBlockSize')}
                  </Col>
                  <Col span={10}>
                    <span style={{fontWeight: '500'}}>
                      {
                        humanReadable(
                          this.info.mining.currentblocksize,
                          false
                        )
                      }
                    </span>
                  </Col>
                </Row>
                <Row>
                  <Col span={2} offset={1}>
                    <i className='material-icons md-18'>playlist_add_check</i>
                  </Col>
                  <Col span={11}>
                    {this.t('wallet:currentBlockTxs')}
                  </Col>
                  <Col span={10}>
                    <span style={{fontWeight: '500'}}>
                      {this.info.mining.currentblocktx}
                    </span>
                  </Col>
                </Row>
                <Row>
                  <Col span={2} offset={1}>
                    <i className='material-icons md-18'>playlist_add</i>
                  </Col>
                  <Col span={11}>
                    {this.t('wallet:pooledTxs')}
                  </Col>
                  <Col span={10}>
                    <span style={{fontWeight: '500'}}>
                      {this.info.mining.pooledtx}
                    </span>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    )
  }
}
