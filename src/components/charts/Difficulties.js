import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import {
  CartesianGrid,
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

/** Required components. */
import { CustomTick, CustomTooltip } from './RechartsCustom'

/** PoW and PoS difficulties chart component. */
@translate(['wallet'], { wait: true })
@inject('stats')
@observer
class Difficulties extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.stats = props.stats
  }

  render () {
    return (
      <ResponsiveContainer height={215} width='100%'>
        <LineChart
          data={this.stats.network}
          margin={{ top: 15, right: 0, bottom: 5, left: 30 }}
          syncId='0'
        >
          <CartesianGrid strokeDasharray='3 3' />
          <Line
            dataKey='powDifficulty'
            dot={false}
            stroke='#EC5E44'
            type='monotone'
            yAxisId='left'
          />
          <Line
            dataKey='posDifficulty'
            dot={false}
            stroke='#FE9950'
            type='monotone'
            yAxisId='right'
          />
          <Tooltip content={<CustomTooltip labelTime />} />
          <XAxis
            dataKey='date'
            domain={['dataMin', 'dataMax']}
            tick={<CustomTick textType='time' textX={0} textY={15} />}
          />
          <YAxis
            orientation='left'
            tick={<CustomTick textType='number' textX={-5} textY={4} />}
            yAxisId='left'
          />
          <YAxis
            orientation='right'
            tick={
              <CustomTick
                textAnchor='start'
                textType='number'
                textX={5}
                textY={4}
              />
            }
            yAxisId='right'
          />
        </LineChart>
      </ResponsiveContainer>
    )
  }
}

export default Difficulties
