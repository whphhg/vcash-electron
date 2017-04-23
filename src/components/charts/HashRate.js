import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import {
  AreaChart,
  Area,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  defs,
  linearGradient,
  stop
} from 'recharts'

/** Required components. */
import { CustomTick, CustomTooltip } from './RechartsCustom'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('stats') @observer

export default class Difficulties extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.stats = props.stats
  }

  render () {
    return (
      <ResponsiveContainer width='100%' height={215}>
        <AreaChart
          data={this.stats.network}
          margin={{top: 15, right: 60, bottom: 5, left: 30}}
          syncId='0'
        >
          <defs>
            <linearGradient id='colorPoW' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='35%' stopColor='#b60127' stopOpacity={0.9} />
              <stop offset='100%' stopColor='#b60127' stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <Area
            dataKey='hashRate'
            fill='url(#colorPoW)'
            fillOpacity={1}
            stroke='#b60127'
            type='monotone'
            yAxisId='left'
          />
          <CartesianGrid strokeDasharray='3 3' />
          <Tooltip content={<CustomTooltip labelTime hashRate />} />
          <XAxis
            dataKey='date'
            domain={['dataMin', 'dataMax']}
            tick={<CustomTick textType='time' textX={0} textY={15} />}
          />
          <YAxis
            orientation='left'
            tick={<CustomTick textType='hashRate' textX={-5} textY={4} />}
            yAxisId='left'
          />
        </AreaChart>
      </ResponsiveContainer>
    )
  }
}
