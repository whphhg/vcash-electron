import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import {
  ScatterChart,
  Scatter,
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

export default class RewardSpread extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.stats = props.stats
  }

  render () {
    const beginning = new Date().getTime() - (30 * 24 * 60 * 60 * 1000)

    return (
      <ResponsiveContainer width='100%' height={210}>
        <ScatterChart
          margin={{top: 15, right: 20, bottom: 5, left: 20}}
        >
          <Scatter
            name={this.t('wallet:stakingReward')}
            data={this.stats.rewardSpread.stakingReward}
            fill='#FE9950'
          />
          <Scatter
            name={this.t('wallet:miningReward')}
            data={this.stats.rewardSpread.miningReward}
            fill='#EC5E44'
          />
          <Scatter
            name={this.t('wallet:incentiveReward')}
            data={this.stats.rewardSpread.incentiveReward}
            fill='#803888'
          />
          <XAxis
            dataKey='date'
            domain={[
              Math.round(beginning),
              Math.round(moment().format('x'))
            ]}
            interval={0}
            tick={
              <CustomTick
                textX={0}
                textY={15}
                textType='date'
              />
            }
            ticks={[
              Math.round(beginning),
              Math.round(moment(beginning).add(6, 'days').format('x')),
              Math.round(moment(beginning).add(11, 'days').format('x')),
              Math.round(moment(beginning).add(16, 'days').format('x')),
              Math.round(moment(beginning).add(21, 'days').format('x')),
              Math.round(moment(beginning).add(26, 'days').format('x')),
              Math.round(moment().format('x'))
            ]}
          />
          <YAxis
            dataKey='y'
            domain={[0, 86400000]}
            interval={0}
            tick={
              <CustomTick
                textX={-5}
                textY={4}
                textType='time'
              />
            }
            ticks={[0, 21600000, 43200000, 64800000, 86400000]}
          />
          <CartesianGrid strokeDasharray='3 3' />
          <Tooltip
            content={
              <CustomTooltip
                tooltipType='rewardSpread'
              />
            }
          />
        </ScatterChart>
      </ResponsiveContainer>
    )
  }
}
