import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

/** Required components. */
import RechartsTooltip from './RechartsTooltip'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('rewardCalculator') @observer

class RewardCalculatorChart extends React.Component {
  constructor (props) {
    super(props)
    this.rewardCalculator = props.rewardCalculator
    this.t = props.t
  }

  render () {
    return (
      <LineChart
        width={480}
        height={230}
        data={this.rewardCalculator.chartData}
        margin={{top: 20, right: 25}}
      >
        <CartesianGrid
          stroke='#CCCCCC'
          strokeDasharray='5 5'
        />
        <Line
          type='monotone'
          dataKey={this.t('wallet:powReward')}
          stroke='#B60127'
        />
        <Line
          type='monotone'
          dataKey={this.t('wallet:miningReward')}
          stroke='#1A237E'
        />
        <Line
          type='monotone'
          dataKey={this.t('wallet:incentiveReward')}
          stroke='#33691E'
        />
        <Tooltip
          content={
            <RechartsTooltip
              labelText={this.t('wallet:rewardSplit')}
            />
          }
        />
        <XAxis dataKey='block' />
        <YAxis />
      </LineChart>
    )
  }
}

export default RewardCalculatorChart
