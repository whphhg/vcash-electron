import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

/** Required components. */
import RechartsTooltip from './RechartsTooltip'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('transactions') @observer

class TransactionsChart extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.transactions = props.transactions
  }

  render () {
    return (
      <LineChart
        width={1099}
        height={150}
        data={this.transactions.chartData}
        margin={{top: 5, right: 39, left: 32}}
      >
        <CartesianGrid
          stroke='#ccc'
          strokeDasharray='6 6'
        />
        <Line
          type='monotone'
          dataKey={this.t('wallet:sent')}
          stroke='#b60127'
        />
        <Line
          type='monotone'
          dataKey={this.t('wallet:received')}
          stroke='#33691E'
        />
        <Line
          type='monotone'
          dataKey={this.t('wallet:stakingReward')}
          stroke='#2066cf'
        />
        <Line
          type='monotone'
          dataKey={this.t('wallet:miningReward')}
          stroke='#cf9720'
        />
        <Line
          type='monotone'
          dataKey={this.t('wallet:incentiveReward')}
          stroke='#7620cf'
        />
        <Tooltip
          content={
            <RechartsTooltip labelText={this.t('wallet:statisticsFor')} />
          }
        />
        <XAxis dataKey='date' />
        <YAxis />
      </LineChart>
    )
  }
}

export default TransactionsChart
