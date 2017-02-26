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

/** Required components. */
import { CustomTickX, CustomTooltip } from './RechartsCustom'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('transactions') @observer

export default class TransactionsStatistics extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.transactions = props.transactions
  }

  render () {
    return (
      <ResponsiveContainer width='100%' height={155}>
        <AreaChart
          data={this.transactions.chartData}
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
            dataKey={this.t('wallet:sent')}
            stroke='#B60127'
            fillOpacity={1}
            fill='url(#colorSent)'
          />
          <Area
            type='monotone'
            dataKey={this.t('wallet:received')}
            stroke='#33691E'
            fillOpacity={1}
            fill='url(#colorReceived)'
          />
          <Area
            type='monotone'
            dataKey={this.t('wallet:stakingReward')}
            stroke='#FE9950'
            fillOpacity={1}
            fill='url(#colorStaking)'
          />
          <Area
            type='monotone'
            dataKey={this.t('wallet:miningReward')}
            stroke='#EC5E44'
            fillOpacity={1}
            fill='url(#colorMining)'
          />
          <Area
            type='monotone'
            dataKey={this.t('wallet:incentiveReward')}
            stroke='#803888'
            fillOpacity={1}
            fill='url(#colorIncentive)'
          />
          <XAxis
            dataKey='date'
            tick={<CustomTickX />}
          />
          <CartesianGrid strokeDasharray='3 3' />
          <Tooltip
            content={
              <CustomTooltip
                labelText={this.t('wallet:statisticsFor')}
              />
            }
          />
        </AreaChart>
      </ResponsiveContainer>
    )
  }
}
