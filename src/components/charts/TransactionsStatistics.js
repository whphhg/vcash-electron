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

/** Transactions statistics chart component. */
@translate(['wallet'], { wait: true })
@inject('stats')
@observer
class TransactionsStatistics extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.stats = props.stats
  }

  render () {
    const beginning = new Date().getTime() - 31 * 24 * 60 * 60 * 1000

    return (
      <ResponsiveContainer height={160} width='100%'>
        <AreaChart
          data={this.stats.dailyTotals}
          margin={{ top: 10, right: 37, bottom: 0, left: 37 }}
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
            dataKey='sent'
            fill='url(#colorSent)'
            fillOpacity={1}
            stroke='#B60127'
            type='monotone'
          />
          <Area
            dataKey='received'
            fill='url(#colorReceived)'
            fillOpacity={1}
            stroke='#33691E'
            type='monotone'
          />
          <Area
            dataKey='stakingReward'
            fill='url(#colorStaking)'
            fillOpacity={1}
            stroke='#FE9950'
            type='monotone'
          />
          <Area
            dataKey='miningReward'
            fill='url(#colorMining)'
            fillOpacity={1}
            stroke='#EC5E44'
            type='monotone'
          />
          <Area
            dataKey='incentiveReward'
            fill='url(#colorIncentive)'
            fillOpacity={1}
            stroke='#803888'
            type='monotone'
          />
          <CartesianGrid strokeDasharray='3 3' />
          <Tooltip content={<CustomTooltip amounts />} />
          <XAxis
            dataKey='date'
            domain={[Math.round(beginning), Math.round(moment().format('x'))]}
            interval={4}
            tick={<CustomTick textType='date' textX={0} textY={15} />}
          />
        </AreaChart>
      </ResponsiveContainer>
    )
  }
}

export default TransactionsStatistics
