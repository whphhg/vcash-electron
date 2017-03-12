import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import moment from 'moment'

/** Required components. */
import { CustomTick, CustomTooltip } from './RechartsCustom'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('stats') @observer

export default class RewardsPerDay extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.stats = props.stats
  }

  render () {
    const beginning = new Date().getTime() - (30 * 24 * 60 * 60 * 1000)

    return (
      <ResponsiveContainer width='100%' height={210}>
        <BarChart
          data={this.stats.rewardsPerDay}
          margin={{top: 15, right: 20, bottom: 5, left: 20}}
        >
          <Bar
            dataKey='stakingReward'
            stackId='a'
            fill='#FE9950'
          />
          <Bar
            dataKey='miningReward'
            stackId='a'
            fill='#EC5E44'
          />
          <Bar
            dataKey='incentiveReward'
            stackId='a'
            fill='#803888'
          />
          <XAxis
            dataKey='date'
            domain={[
              Math.round(beginning),
              Math.round(moment().format('x'))
            ]}
            tick={
              <CustomTick
                textX={0}
                textY={15}
                textType='date'
              />
            }
            interval={4}
          />
          <YAxis
            tick={
              <CustomTick
                textX={-5}
                textY={4}
              />
            }
          />
          <CartesianGrid strokeDasharray='3 3' />
          <Tooltip
            content={
              <CustomTooltip />
            }
          />
        </BarChart>
      </ResponsiveContainer>
    )
  }
}
