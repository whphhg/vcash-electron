import React from 'react'
import { inject, observer } from 'mobx-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import moment from 'moment'

/** Required components. */
import { CustomTick, CustomTooltip } from './RechartsCustom'

/** Rewards per day chart component. */
@inject('stats')
@observer
class RewardsPerDay extends React.Component {
  constructor (props) {
    super(props)
    this.stats = props.stats
  }

  render () {
    const beginning = new Date().getTime() - 30 * 24 * 60 * 60 * 1000

    return (
      <ResponsiveContainer height={215} width='100%'>
        <BarChart
          data={this.stats.rewardsPerDay}
          margin={{ top: 15, right: 20, bottom: 5, left: 20 }}
        >
          <Bar dataKey='stakingReward' fill='#FE9950' stackId='a' />
          <Bar dataKey='miningReward' fill='#EC5E44' stackId='a' />
          <Bar dataKey='incentiveReward' fill='#803888' stackId='a' />
          <CartesianGrid strokeDasharray='3 3' />
          <Tooltip content={<CustomTooltip />} />
          <XAxis
            dataKey='date'
            domain={[Math.round(beginning), Math.round(moment().format('x'))]}
            interval={4}
            tick={<CustomTick textType='date' textX={0} textY={15} />}
          />
          <YAxis tick={<CustomTick textX={-5} textY={4} />} />
        </BarChart>
      </ResponsiveContainer>
    )
  }
}

export default RewardsPerDay
