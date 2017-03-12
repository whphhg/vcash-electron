import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  defs,
  linearGradient,
  stop
} from 'recharts'
import moment from 'moment'

/** Required components. */
import { CustomTick, CustomTooltip } from './RechartsCustom'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('stats') @observer

export default class TransactionsStatistics extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.stats = props.stats
  }

  render () {
    const beginning = new Date().getTime() - (31 * 24 * 60 * 60 * 1000)

    return (
      <ResponsiveContainer width='100%' height={155}>
        <AreaChart
          data={this.stats.dailyTotals}
          margin={{top: 5, right: 37, bottom: 0, left: 37}}
        >
          <defs>
            <linearGradient id='colorSent' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#B60127' stopOpacity={0.8} />
              <stop offset='95%' stopColor='#B60127' stopOpacity={0} />
            </linearGradient>
            <linearGradient id='colorReceived' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#33691E' stopOpacity={0.8} />
              <stop offset='95%' stopColor='#33691E' stopOpacity={0} />
            </linearGradient>
            <linearGradient id='colorStaking' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#FE9950' stopOpacity={0.8} />
              <stop offset='95%' stopColor='#FE9950' stopOpacity={0} />
            </linearGradient>
            <linearGradient id='colorMining' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#EC5E44' stopOpacity={0.8} />
              <stop offset='95%' stopColor='#EC5E44' stopOpacity={0} />
            </linearGradient>
            <linearGradient id='colorIncentive' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#803888' stopOpacity={0.8} />
              <stop offset='95%' stopColor='#803888' stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type='monotone'
            dataKey='sent'
            stroke='#B60127'
            fillOpacity={1}
            fill='url(#colorSent)'
          />
          <Area
            type='monotone'
            dataKey='received'
            stroke='#33691E'
            fillOpacity={1}
            fill='url(#colorReceived)'
          />
          <Area
            type='monotone'
            dataKey='stakingReward'
            stroke='#FE9950'
            fillOpacity={1}
            fill='url(#colorStaking)'
          />
          <Area
            type='monotone'
            dataKey='miningReward'
            stroke='#EC5E44'
            fillOpacity={1}
            fill='url(#colorMining)'
          />
          <Area
            type='monotone'
            dataKey='incentiveReward'
            stroke='#803888'
            fillOpacity={1}
            fill='url(#colorIncentive)'
          />
          <XAxis
            dataKey='date'
            domain={[
              Math.round(beginning),
              Math.round(moment().format('x'))
            ]}
            interval={4}
            tick={
              <CustomTick
                textX={0}
                textY={15}
                textType='date'
              />
            }
          />
          <CartesianGrid strokeDasharray='3 3' />
          <Tooltip
            content={
              <CustomTooltip
                amounts
              />
            }
          />
        </AreaChart>
      </ResponsiveContainer>
    )
  }
}
