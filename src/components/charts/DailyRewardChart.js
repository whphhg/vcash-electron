import React from 'react'
import { inject, observer } from 'mobx-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import moment from 'moment'

/** Components */
import { CustomTick, CustomTooltip } from './CustomRecharts.js'

@inject('gui', 'statistics')
@observer
class DailyRewardChart extends React.Component {
  constructor(props) {
    super(props)
    this.gui = props.gui
    this.statistics = props.statistics
  }

  render() {
    const beginning = Date.now() - 30 * 24 * 60 * 60 * 1000
    return (
      <ResponsiveContainer height={250} width="100%">
        <BarChart
          data={this.statistics.dailyRewards}
          margin={{ top: 15, right: 20, bottom: 5, left: 20 }}
        >
          <Bar dataKey="stakingReward" fill="#FE9950" stackId="a" />
          <Bar dataKey="miningReward" fill="#EC5E44" stackId="a" />
          <Bar dataKey="incentiveReward" fill="#803888" stackId="a" />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip content={<CustomTooltip language={this.gui.language} />} />
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
          <YAxis
            tick={
              <CustomTick language={this.gui.language} textX={-5} textY={4} />
            }
          />
        </BarChart>
      </ResponsiveContainer>
    )
  }
}

export default DailyRewardChart
