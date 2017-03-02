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
import {
  ScatterTickX,
  ScatterTickY,
  ScatterTooltip
} from './RechartsCustom'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('transactions') @observer

export default class RewardSpread extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.transactions = props.transactions
  }

  render () {
    const beginning = new Date().getTime() - (31 * 24 * 60 * 60 * 1000)

    return (
      <ResponsiveContainer width='100%' height={220}>
        <ScatterChart
          margin={{top: 15, right: 20, bottom: 5, left: 20}}
        >
          <Scatter
            name={this.t('wallet:stakingReward')}
            data={this.transactions.rewardSpread.stakingReward}
            fill='#FE9950'
          />
          <Scatter
            name={this.t('wallet:miningReward')}
            data={this.transactions.rewardSpread.miningReward}
            fill='#EC5E44'
          />
          <Scatter
            name={this.t('wallet:incentiveReward')}
            data={this.transactions.rewardSpread.incentiveReward}
            fill='#803888'
          />
          <XAxis
            dataKey='x'
            domain={[
              Math.round(beginning),
              Math.round(moment().format('x'))
            ]}
            interval={0}
            tick={<ScatterTickX />}
            ticks={[
              Math.round(beginning),
              Math.round(moment(beginning).add(6, 'days').format('x')),
              Math.round(moment(beginning).add(12, 'days').format('x')),
              Math.round(moment(beginning).add(19, 'days').format('x')),
              Math.round(moment(beginning).add(25, 'days').format('x')),
              Math.round(moment().format('x'))
            ]}
          />
          <YAxis
            dataKey='y'
            domain={[0, 86400000]}
            interval={0}
            tick={<ScatterTickY />}
            ticks={[0, 21600000, 43200000, 64800000, 86400000]}
          />
          <CartesianGrid strokeDasharray='3 3' />
          <Tooltip
            content={
              <ScatterTooltip />
            }
          />
        </ScatterChart>
      </ResponsiveContainer>
    )
  }
}
