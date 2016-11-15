import React from 'react'
import { observer } from 'mobx-react'
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
    this.setBlock = this.setBlock.bind(this)

    /** Calculate current block when loading the component. */
    this.rewardCalculator.setBlock(this.wallet.info.blocks)
  }

  setBlock(event) {
    this.rewardCalculator.setBlock(event.target.value)
  }

  popoverTitle() {
    return (
      <Row>
        <Col span={2}>
          <span>Block</span>
        </Col>
        <Col span={4}>
          <Input autosize type='text' placeholder='Height' value={this.rewardCalculator.block} onChange={this.setBlock} maxLength={7} />
        </Col>
        <Col span={18}>
          <p style={{textAlign:'right'}}>
            {this.rewardCalculator.estimation === true ? 'Confirmation est. ' : 'Confirmed on '}
            <span className='text-dotted'>{moment(this.rewardCalculator.time).format('YYYY-MM-DD HH:mm:ss')}</span> ({moment().to(this.rewardCalculator.time)})
          </p>
        </Col>
      </Row>
    )
  }

  popoverContent() {
    return (
      <div style={{width:'500px',marginTop:'10px'}}>
        <Row>
          <Col span={6} offset={3}>
            <p>PoW reward</p>
            <p><span className='text-dotted'>{this.rewardCalculator.powReward.toFixed(6)}</span> XVC</p>
          </Col>
          <Col span={7}>
            <p>Miner share</p>
            <p><span className='text-dotted'>{(this.rewardCalculator.powReward - this.rewardCalculator.incentiveReward).toFixed(6)}</span> XVC ({100 - this.rewardCalculator.incentivePercent}%)</p>
          </Col>
          <Col span={7}>
            <p>Incentive share</p>
            <p><span className='text-dotted'>{this.rewardCalculator.incentiveReward.toFixed(6)}</span> XVC ({this.rewardCalculator.incentivePercent}%)</p>
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

  render() {
    return (
      <Popover trigger='click' placement='bottomLeft' title={this.popoverTitle()} content={this.popoverContent()}>
        <Button>Reward calculator</Button>
      </Popover>
    )
  }
}

export default RewardCalculator
