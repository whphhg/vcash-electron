import React from 'react'
import { inject, observer } from 'mobx-react'
import { Button, Col, Input, Popover, Row } from 'antd'
import moment from 'moment'

/** Required components. */
import RewardCalculatorChart from './RewardCalculatorChart'

/** Make the component reactive and inject MobX stores. */
@observer(['rewardCalculator', 'wallet'])

class RewardCalculator extends React.Component {
  constructor(props) {
    super(props)
    this.rewardCalculator = props.rewardCalculator
    this.wallet = props.wallet

    /** Calculate current block when loading component. */
    this.rewardCalculator.setBlock(this.wallet.blocks)

    /** Bind functions early. */
    this.onChange = this.onChange.bind(this)
  }

  onChange(event) {
    this.rewardCalculator.setBlock(event.target.value)
  }

  render() {
    return (
      <Popover
        trigger='click'
        placement='bottomRight'
        title={
          <Row>
            <Col span={2}>
              <span>Block</span>
            </Col>
            <Col span={4}>
              <Input type='text' autosize
                placeholder='Enter block number'
                value={this.rewardCalculator.block}
                onChange={this.onChange}
                maxLength={7}
              />
            </Col>
            <Col span={18}>
              <p style={{textAlign:'right'}}>
                {this.rewardCalculator.estimate ? 'Confirmation est. ' : 'Confirmed on '}
                <span className='font-weight-500'>{moment(this.rewardCalculator.time).format('YYYY-MM-DD HH:mm:ss')}</span> ({moment().to(this.rewardCalculator.time.toISOString())})
              </p>
            </Col>
          </Row>
        }
        content={
          <Row style={{width:'500px', marginTop:'10px'}}>
            <Col offset={6} span={6}>
              <p>PoW reward</p>
              <p>Miner share</p>
              <p>Incentive share</p>
            </Col>

            <Col span={6}>
              <p><span className='font-weight-500'>{this.rewardCalculator.powReward}</span> XVC</p>
              <p><span className='font-weight-500'>{(this.rewardCalculator.powReward - this.rewardCalculator.incentiveReward).toFixed(6)}</span> XVC</p>
              <p><span className='font-weight-500'>{this.rewardCalculator.incentiveReward}</span> XVC</p>
            </Col>

            <Col span={2}>
              <p>&nbsp;</p>
              <p><span className='font-weight-500'>{100 - this.rewardCalculator.powPercent}</span>%</p>
              <p><span className='font-weight-500'>{this.rewardCalculator.powPercent}</span>%</p>
            </Col>

            <Col span={24}>
              <RewardCalculatorChart />
            </Col>
          </Row>
        }
      >
        <Button>Reward calculator</Button>
      </Popover>
    )
  }
}

export default RewardCalculator
