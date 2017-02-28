import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Button, Col, Row } from 'antd'

/** Required components. */
import RewardCalculator from './RewardCalculator'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('network', 'transactions', 'ui', 'wallet') @observer

export default class Incentive extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.network = props.network
    this.transactions = props.transactions
    this.ui = props.ui
    this.wallet = props.wallet
    this.incentiveStake = this.incentiveStake.bind(this)
  }

  incentiveStake () {
    this.network.incentiveStake()
  }

  render () {
    return (
      <div>
        <Row>
          <Col span={24} className='shadow'>
            <div className='toolbar'>
              <Button
                onClick={this.incentiveStake}
                disabled={this.wallet.isLocked === true}
                size='small'
                className='left'
                style={{margin: '0 10px 0 0'}}
              >
                {this.t('wallet:stakeCollateral')}
              </Button>
              <i className='material-icons md-20 left'>redeem</i>
              <div className='left' style={{margin: '0 10px 0 0'}}>
                <p>{this.t('wallet:collateralBalance')}&nbsp;
                  <span>
                    {
                      new Intl.NumberFormat(this.ui.language, {
                        maximumFractionDigits: 6
                      }).format(this.network.incentiveInfo.collateralbalance)
                    }/
                    {
                      new Intl.NumberFormat(this.ui.language)
                        .format(this.network.incentiveInfo.collateralrequired)
                    }
                  </span> XVC
                </p>
              </div>
              <i className='material-icons md-20 left'>verified_user</i>
              <div className='left'>
                <p>{this.t('wallet:voteCandidate')}&nbsp;
                  <span>
                    {
                      this.network.incentiveInfo.votecandidate === true
                        ? this.t('wallet:yes')
                        : this.t('wallet:no')
                    }
                  </span>
                </p>
              </div>
              <div className='right'>
                <p>{this.t('wallet:defaultAddress')}&nbsp;
                  <span>
                    {
                      this.network.incentiveInfo.walletaddress === ''
                        ? this.t('wallet:unlockRevealed')
                        : this.network.incentiveInfo.walletaddress
                    }
                  </span>
                </p>
              </div>
              <i className='material-icons md-20 right'>library_books</i>
            </div>
          </Col>
        </Row>
        <Row id='network' className='shadow'>
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
              <Row>
                <Col span={1}>
                  <i className='material-icons md-18'>view_week</i>
                </Col>
                <Col span={10}>
                  {this.t('wallet:rewardsPerDay')}
                </Col>
              </Row>
            </div>
          </Col>
          <Col span={12}>
            <div style={{margin: '10px 10px 0 10px'}}>
              <Row>
                <Col span={1}>
                  <i className='material-icons md-18'>trending_up</i>
                </Col>
                <Col span={10}>
                  {this.t('wallet:powDifficulty')}
                </Col>
              </Row>
              <Row>
                <Col span={1}>
                  <i className='material-icons md-18'>trending_up</i>
                </Col>
                <Col span={10}>
                  {this.t('wallet:posDifficulty')}
                </Col>
              </Row>
              <Row>
                <Col span={1}>
                  <i className='material-icons md-18'>network_check</i>
                </Col>
                <Col span={10}>
                  {this.t('wallet:networkHashRate')}
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
        <Row id='network-info'>
          <Col span={7}>
            <RewardCalculator />
          </Col>
          <Col span={15} offset={2}>
            <Row>
              <Col span={12}>
                <Row>
                  <Col span={2}>
                    <i className='material-icons md-18'>computer</i>
                  </Col>
                  <Col span={11}>
                    {this.t('wallet:listeningOn')}
                  </Col>
                  <Col span={11}>
                    <span className='text-dotted'>
                      {this.wallet.info.ip}:{this.wallet.info.port}
                    </span>
                  </Col>
                </Row>
                <Row>
                  <Col span={2}>
                    <i className='material-icons md-18'>hearing</i>
                  </Col>
                  <Col span={11}>
                    {this.t('wallet:portStatus')}
                  </Col>
                  <Col span={11}>
                    <span className='text-dotted'>
                      {
                        this.network.incentiveInfo.networkstatus === 'ok'
                          ? this.t('wallet:open')
                          : this.t('wallet:closed')
                      }
                    </span>
                  </Col>
                </Row>
                <Row>
                  <Col span={2}>
                    <i className='material-icons md-18'>verified_user</i>
                  </Col>
                  <Col span={11}>
                    {this.t('wallet:collateralizedNodes')}
                  </Col>
                  <Col span={11}>
                    <span className='text-dotted'>
                      {this.network.collateralized}/{this.network.endpoints}
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
                    <span className='text-dotted'>
                      {
                        this.network.miningInfo.testnet === true
                          ? this.t('wallet:yes')
                          : this.t('wallet:no')
                      }
                    </span>
                  </Col>
                </Row>
              </Col>
              <Col span={12}>
                <Row>
                  <Col span={2} offset={2}>
                    <i className='material-icons md-18'>account_balance</i>
                  </Col>
                  <Col span={10}>
                    {this.t('wallet:moneySupply')}
                  </Col>
                  <Col span={10}>
                    <span className='text-dotted'>
                      {
                        new Intl.NumberFormat(this.ui.language, {
                          maximumFractionDigits: 0
                        }).format(this.wallet.info.moneysupply)
                      }
                    </span> XVC
                  </Col>
                </Row>
                <Row>
                  <Col span={2} offset={2}>
                    <i className='material-icons md-18'>grid_on</i>
                  </Col>
                  <Col span={10}>
                    {this.t('wallet:currentBlockSize')}
                  </Col>
                  <Col span={10}>
                    <span className='text-dotted'>
                      {this.network.miningInfo.currentblocksize}
                    </span> bytes
                  </Col>
                </Row>
                <Row>
                  <Col span={2} offset={2}>
                    <i className='material-icons md-18'>playlist_add_check</i>
                  </Col>
                  <Col span={10}>
                    {this.t('wallet:currentBlockTxs')}
                  </Col>
                  <Col span={10}>
                    <span className='text-dotted'>
                      {this.network.miningInfo.currentblocktx}
                    </span>
                  </Col>
                </Row>
                <Row>
                  <Col span={2} offset={2}>
                    <i className='material-icons md-18'>playlist_add</i>
                  </Col>
                  <Col span={10}>
                    {this.t('wallet:pooledTxs')}
                  </Col>
                  <Col span={10}>
                    <span className='text-dotted'>
                      {this.network.miningInfo.pooledtx}
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
