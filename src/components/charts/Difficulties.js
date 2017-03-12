import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
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
        <LineChart
          data={this.stats.network}
          syncId='0'
          margin={{top: 15, right: 0, bottom: 5, left: 30}}
        >
          <Line
            yAxisId='left'
            type='monotone'
            dataKey='powDifficulty'
            stroke='#EC5E44'
            dot={false}
          />
          <Line
            yAxisId='right'
            type='monotone'
            dataKey='posDifficulty'
            stroke='#FE9950'
            dot={false}
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
                textType='number'
              />
            }
          />
          <YAxis
            yAxisId='right'
            orientation='right'
            tick={
              <CustomTick
                textX={5}
                textY={4}
                textAnchor='start'
                textType='number'
              />
            }
          />
          <CartesianGrid strokeDasharray='3 3' />
          <Tooltip
            content={
              <CustomTooltip labelTime />
            }
          />
        </LineChart>
      </ResponsiveContainer>
    )
  }
}
