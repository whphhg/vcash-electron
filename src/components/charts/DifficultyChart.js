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

/** Components */
import { CustomTick, CustomTooltip } from './CustomRecharts'

@translate(['wallet'])
@inject('gui', 'statistics')
@observer
class DifficultyChart extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.statistics = props.statistics
  }

  render() {
    return (
      <ResponsiveContainer height={250} width="100%">
        <LineChart
          data={this.statistics.network}
          margin={{ top: 15, right: 0, bottom: 5, left: 30 }}
          syncId="0"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <Line
            dataKey="powDifficulty"
            dot={false}
            stroke="#EC5E44"
            type="monotone"
            yAxisId="left"
          />
          <Line
            dataKey="posDifficulty"
            dot={false}
            stroke="#FE9950"
            type="monotone"
            yAxisId="right"
          />
          <Tooltip
            content={<CustomTooltip labelTime language={this.gui.language} />}
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
                textType="number"
                textX={-5}
                textY={4}
              />
            }
            yAxisId="left"
          />
          <YAxis
            orientation="right"
            tick={
              <CustomTick
                language={this.gui.language}
                textAnchor="start"
                textType="number"
                textX={5}
                textY={4}
              />
            }
            yAxisId="right"
          />
        </LineChart>
      </ResponsiveContainer>
    )
  }
}

export default DifficultyChart
