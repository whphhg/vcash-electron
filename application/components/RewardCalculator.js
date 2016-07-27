import React from 'react'
import { inject, observer } from 'mobx-react'
import moment from 'moment'
import TextField from 'material-ui/TextField'

@inject('rewardCalculator')
@inject('wallet')
@observer

class RewardCalculator extends React.Component {
  constructor(props) {
    super(props)

    this.rewardCalculator = props.rewardCalculator
    this.wallet = props.wallet

    this.rewardCalculator.setBlock(this.wallet.blocks)
    this.onChange = this.onChange.bind(this)
  }

  onChange(event) {
    const block = event.target.value
    this.rewardCalculator.setBlock(block)
  }

  render() {
    return (
      <div>
        <TextField
          value={this.rewardCalculator.block}
          onChange={this.onChange}
          maxLength={7}
          hintText='Enter block number'
          floatingLabelStyle={{fontWeight:'normal'}}
          floatingLabelText='Calculate block rewards'
          fullWidth={true}
        />
        {
          this.rewardCalculator.block &&
          (
            <div>
              <div className='row'>
                <div className='col-md-12'>
                  <p>
                    { this.rewardCalculator.estimate ? 'Confirmation est.' : 'Confirmed on' }
                    <span className='font-weight-500'> {moment(this.rewardCalculator.time).format('YYYY-MM-DD HH:mm:ss')} </span>
                    (<span className='font-weight-500'>{moment().to(this.rewardCalculator.time.toISOString())}</span>)
                  </p>
                </div>
              </div>

              <div className='row'>
                <div className='col-md-5 noPadding noMargin'>
                  <p>PoW reward</p>
                  <p>Miner share</p>
                  <p>Incentive share</p>
                </div>

                <div className='col-md-5 noPadding noMargin textRight'>
                  <p><span className='font-weight-500'>{this.rewardCalculator.powReward}</span> XVC</p>
                  <p><span className='font-weight-500'>{(this.rewardCalculator.powReward - this.rewardCalculator.incentiveReward).toFixed(6)}</span> XVC</p>
                  <p><span className='font-weight-500'>{this.rewardCalculator.incentiveReward}</span> XVC</p>
                </div>

                <div className='col-md-2 noPadding noMargin'>
                  <p>&nbsp;</p>
                  <p><span className='font-weight-500'>{100 - this.rewardCalculator.powPercent}</span>%</p>
                  <p><span className='font-weight-500'>{this.rewardCalculator.powPercent}</span>%</p>
                </div>
              </div>
            </div>
          )
        }
      </div>
    )
  }
}

export default RewardCalculator
