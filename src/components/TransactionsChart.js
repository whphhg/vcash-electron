import React from 'react'
import { inject, observer } from 'mobx-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

/** Required components. */
import RechartsTooltip from './RechartsTooltip'

/** Make the component reactive and inject MobX stores. */
@inject('transactions') @observer

class TransactionsChart extends React.Component {
  constructor (props) {
    super(props)
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
          dataKey='Sent'
          stroke='#b60127'
        />
        <Line
          type='monotone'
          dataKey='Received'
          stroke='#33691E'
        />
        <Line
          type='monotone'
          dataKey='Staking reward'
          stroke='#2066cf'
        />
        <Line
          type='monotone'
          dataKey='Mining reward'
          stroke='#cf9720'
        />
        <Line
          type='monotone'
          dataKey='Incentive reward'
          stroke='#7620cf'
        />
        <Tooltip
          content={
            <RechartsTooltip labelText='Statistics for' />
          }
        />
        <XAxis dataKey='date' />
        <YAxis />
      </LineChart>
    )
  }
}

export default TransactionsChart
