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

/** Components */
import { CustomTick, CustomTooltip } from './CustomRecharts.js'

@translate(['wallet'])
@inject('gui', 'statistics')
@observer
class DailyTotalsChart extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.statistics = props.statistics
  }

  render() {
    const beginning = new Date().getTime() - 31 * 24 * 60 * 60 * 1000
    return (
      <ResponsiveContainer height={160} width="100%">
        <AreaChart
          data={this.statistics.dailyTotals}
          margin={{ top: 0, right: 20, bottom: 0, left: 20 }}
        >
          <defs>
            <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#B60127" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#B60127" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#33691E" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#33691E" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorStaking" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FE9950" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#FE9950" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorMining" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EC5E44" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#EC5E44" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorIncentive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#803888" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#803888" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            dataKey="sent"
            fill="url(#colorSent)"
            fillOpacity={1}
            stroke="#B60127"
            type="monotone"
          />
          <Area
            dataKey="received"
            fill="url(#colorReceived)"
            fillOpacity={1}
            stroke="#33691E"
            type="monotone"
          />
          <Area
            dataKey="stakingReward"
            fill="url(#colorStaking)"
            fillOpacity={1}
            stroke="#FE9950"
            type="monotone"
          />
          <Area
            dataKey="miningReward"
            fill="url(#colorMining)"
            fillOpacity={1}
            stroke="#EC5E44"
            type="monotone"
          />
          <Area
            dataKey="incentiveReward"
            fill="url(#colorIncentive)"
            fillOpacity={1}
            stroke="#803888"
            type="monotone"
          />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip
            content={<CustomTooltip amounts language={this.gui.language} />}
          />
          <XAxis
            dataKey="date"
            domain={[Math.round(beginning), Math.round(moment().format('x'))]}
            interval={4}
            tick={
              <CustomTick
                language={this.gui.language}
                textType="date"
                textX={0}
                textY={15}
              />
            }
          />
        </AreaChart>
      </ResponsiveContainer>
    )
  }
}

export default DailyTotalsChart
