import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import moment from 'moment'

/** Components */
import { CustomTick, CustomTooltip } from './CustomRecharts.js'

@translate(['common'])
@inject('gui', 'statistics')
@observer
class RewardSpreadChart extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.statistics = props.statistics
  }

  render() {
    const beginning = new Date().getTime() - 30 * 24 * 60 * 60 * 1000
    return (
      <ResponsiveContainer height={250} width="100%">
        <ScatterChart margin={{ top: 15, right: 20, bottom: 5, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <Scatter
            data={this.statistics.rewardSpread.stakingReward}
            fill="#FE9950"
            name={this.t('stakingReward')}
          />
          <Scatter
            data={this.statistics.rewardSpread.miningReward}
            fill="#EC5E44"
            name={this.t('miningReward')}
          />
          <Scatter
            data={this.statistics.rewardSpread.incentiveReward}
            fill="#803888"
            name={this.t('incentiveReward')}
          />
          <Tooltip
            content={
              <CustomTooltip
                language={this.gui.language}
                tooltipType="rewardSpread"
              />
            }
          />
          <XAxis
            dataKey="date"
            domain={[Math.round(beginning), Math.round(moment().format('x'))]}
            interval={0}
            tick={
              <CustomTick
                language={this.gui.language}
                textType="date"
                textX={0}
                textY={15}
              />
            }
            ticks={[
              Math.round(beginning),
              Math.round(
                moment(beginning)
                  .add(6, 'days')
                  .format('x')
              ),
              Math.round(
                moment(beginning)
                  .add(11, 'days')
                  .format('x')
              ),
              Math.round(
                moment(beginning)
                  .add(16, 'days')
                  .format('x')
              ),
              Math.round(
                moment(beginning)
                  .add(21, 'days')
                  .format('x')
              ),
              Math.round(
                moment(beginning)
                  .add(26, 'days')
                  .format('x')
              ),
              Math.round(moment().format('x'))
            ]}
          />
          <YAxis
            dataKey="y"
            domain={[0, 86400000]}
            interval={0}
            tick={
              <CustomTick
                language={this.gui.language}
                textType="time"
                textX={-5}
                textY={4}
              />
            }
            ticks={[0, 21600000, 43200000, 64800000, 86400000]}
          />
        </ScatterChart>
      </ResponsiveContainer>
    )
  }
}

export default RewardSpreadChart
