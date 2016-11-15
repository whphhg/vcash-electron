import React from 'react'
import { observer } from 'mobx-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

/** Make the component reactive and inject MobX stores. */
@observer(['rewardCalculator'])

class RewardCalculatorChart extends React.Component {
  constructor(props) {
    super(props)
    this.rewardCalculator = props.rewardCalculator
  }

  render() {
    return (
      <LineChart width={480} height={230} data={this.rewardCalculator.chartData} margin={{top:20, right:25}}>
        <CartesianGrid stroke='#CCCCCC' strokeDasharray='5 5' />
        <Line type='monotone' dataKey='PoW reward' stroke='#B60127' />
        <Line type='monotone' dataKey='Miner share' stroke='#1A237E' />
        <Line type='monotone' dataKey='Incentive share' stroke='#33691E' />
        <Tooltip />
        <XAxis dataKey='block' />
        <YAxis />
      </LineChart>
    )
  }
}

export default RewardCalculatorChart
