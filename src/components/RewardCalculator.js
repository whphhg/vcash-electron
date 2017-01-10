import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Button, Col, Input, Popover, Row } from 'antd'
import moment from 'moment'

/** Required components. */
import RewardCalculatorChart from './RewardCalculatorChart'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('rewardCalculator', 'wallet') @observer

class RewardCalculator extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.rewardCalculator = props.rewardCalculator
    this.wallet = props.wallet
    this.setBlock = this.setBlock.bind(this)

    /** Calculate current block when loading the component. */
    this.rewardCalculator.setBlock(this.wallet.info.blocks)
  }

  setBlock (e) {
    this.rewardCalculator.setBlock(e.target.value)
  }

  popoverTitle () {
    const { block, estimation, time } = this.rewardCalculator

    return (
      <Row>
        <Col span={2}>
          <span>
            {this.t('wallet:block')}
          </span>
        </Col>
        <Col span={3}>
          <Input
            placeholder={this.t('wallet:height')}
            value={block}
            onChange={this.setBlock}
            maxLength={7}
          />
        </Col>
        <Col span={19}>
          <p className='text-right'>
            {
              estimation === true
                ? this.t('wallet:blockEstimation') + ' '
                : this.t('wallet:blockFound') + ' '
            }
            <span className='text-dotted'>
              {moment(time).format('l - HH:mm:ss')}
            </span>
            {' (' + moment().to(time)})
          </p>
        </Col>
      </Row>
    )
  }

  popoverContent () {
    const { powReward, incentiveReward, incentivePercent } = this.rewardCalculator

    return (
      <div style={{width: '500px', margin: '10px 0 0 0'}}>
        <Row>
          <Col span={6} offset={3}>
            <p>{this.t('wallet:powReward')}</p>
            <p>
              <span className='text-dotted'>
                {powReward.toFixed(6)}
              </span> XVC
            </p>
          </Col>
          <Col span={7}>
            <p>{this.t('wallet:miningReward')}</p>
            <p>
              <span className='text-dotted'>
                {(powReward - incentiveReward).toFixed(6)}
              </span>
              <span> XVC ({100 - incentivePercent}%)</span>
            </p>
          </Col>
          <Col span={7}>
            <p>{this.t('wallet:incentiveReward')}</p>
            <p>
              <span className='text-dotted'>
                {incentiveReward.toFixed(6)}
              </span>
              <span> XVC ({incentivePercent}%)</span>
            </p>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <RewardCalculatorChart />
          </Col>
        </Row>
      </div>
    )
  }

  render () {
    return (
      <Popover
        trigger='click'
        placement='bottomLeft'
        title={this.popoverTitle()}
        content={this.popoverContent()}
      >
        <Button>{this.t('wallet:rewardCalculator')}</Button>
      </Popover>
    )
  }
}

export default RewardCalculator
