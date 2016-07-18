import React from 'react'
import TextField from 'material-ui/TextField'
import moment from 'moment'

const RewardCalculator = ({ block, time, estimate, incentiveReward, powPercent, powReward, rewardCalculator }) => {
  let timer = 0

  const onChange = (event) => {
    const block = event.target.value
    clearTimeout(timer)

    timer = setTimeout(() => {
      rewardCalculator(block)
    }, 0.5 * 1000)
  }

  process.env.NODE_ENV === 'development' && console.log('%c' + '<RewardCalculator />', 'color:#673AB7')
  return (
    <div>
      <TextField
        defaultValue={block}
        onChange={onChange}
        maxLength={7}
        hintText='Enter block number'
        floatingLabelStyle={{fontWeight:'normal'}}
        floatingLabelText='Calculate block rewards'
        fullWidth={true}
      />
      {
        block &&

        <div>
          <div className='row'>
            <div className='col-md-12'>
              <p>
                {estimate ? 'Confirmation est.' : 'Confirmed on'}
                <span className='font-weight-500'> {moment(time).format('YYYY-MM-DD HH:mm:ss')} </span>
                (<span className='font-weight-500'>{moment().to(time.toISOString())}</span>)
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
              <p><span className='font-weight-500'>{powReward}</span> XVC</p>
              <p><span className='font-weight-500'>{(powReward - incentiveReward).toFixed(6)}</span> XVC</p>
              <p><span className='font-weight-500'>{incentiveReward}</span> XVC</p>
            </div>

            <div className='col-md-2 noPadding noMargin'>
              <p>&nbsp;</p>
              <p><span className='font-weight-500'>{100 - powPercent}</span>%</p>
              <p><span className='font-weight-500'>{powPercent}</span>%</p>
            </div>
          </div>
        </div>
      }
    </div>
  )
}

export default RewardCalculator
