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

/** Components */
import { CustomTick, CustomTooltip } from './CustomRecharts.js'

@translate(['wallet'])
@inject('gui', 'statistics')
@observer
class HashRateChart extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.statistics = props.statistics
  }

  render() {
    return (
      <ResponsiveContainer height={250} width="100%">
        <AreaChart
          data={this.statistics.network}
          margin={{ top: 15, right: 60, bottom: 5, left: 30 }}
          syncId="0"
        >
          <defs>
            <linearGradient id="colorPoW" x1="0" y1="0" x2="0" y2="1">
              <stop offset="35%" stopColor="#b60127" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#b60127" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <Area
            dataKey="hashRate"
            fill="url(#colorPoW)"
            fillOpacity={1}
            stroke="#b60127"
            type="monotone"
            yAxisId="left"
          />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip
            content={
              <CustomTooltip hashRate labelTime language={this.gui.language} />
            }
          />
          <XAxis
            dataKey="date"
            domain={['dataMin', 'dataMax']}
            tick={
              <CustomTick
                language={this.gui.language}
                textType="time"
                textX={0}
                textY={15}
              />
            }
          />
          <YAxis
            orientation="left"
            tick={
              <CustomTick
                language={this.gui.language}
                textType="hashRate"
                textX={-5}
                textY={4}
              />
            }
            yAxisId="left"
          />
        </AreaChart>
      </ResponsiveContainer>
    )
  }
}

export default HashRateChart
