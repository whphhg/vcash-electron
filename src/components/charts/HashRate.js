import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
      <ResponsiveContainer width='100%' height={210}>
        <AreaChart
          data={this.stats.network}
          syncId='0'
          margin={{top: 15, right: 60, bottom: 5, left: 30}}
        >
          <defs>
            <linearGradient id='colorPoW' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='35%' stopColor='#b60127' stopOpacity={0.9} />
              <stop offset='100%' stopColor='#b60127' stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <Area
            yAxisId='left'
            type='monotone'
            dataKey='hashRate'
            stroke='#b60127'
            fillOpacity={1}
            fill='url(#colorPoW)'
          />
          <XAxis
            dataKey='date'
            domain={['dataMin', 'dataMax']}
            tick={
              <CustomTick
                textX={0}
                textY={15}
                textType='time'
              />
            }
          />
          <YAxis
            yAxisId='left'
            orientation='left'
            tick={
              <CustomTick
                textX={-5}
                textY={4}
                textType='hashRate'
              />
            }
          />
          <CartesianGrid strokeDasharray='3 3' />
          <Tooltip
            content={
              <CustomTooltip labelTime hashRate />
            }
          />
        </AreaChart>
      </ResponsiveContainer>
    )
  }
}
