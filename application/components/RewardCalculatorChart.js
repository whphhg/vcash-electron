import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

const RewardCalculatorChart = ({ chartData }) => {
  process.env.NODE_ENV === 'development' && console.log('%c' + '<RewardCalculatorChart />', 'color:#673AB7')
  return (
    <LineChart width={730} height={230} data={chartData} margin={{top:20, right:25}}>
      <CartesianGrid stroke="#ccc" strokeDasharray="6 6" />
      <Line type="monotone" dataKey='PoW reward' stroke="#b60127" />
      <Line type="monotone" dataKey='Miner share' stroke="#1A237E" />
      <Line type="monotone" dataKey='Incentive share' stroke="#33691E" />
      <Tooltip />
      <XAxis dataKey='block' />
      <YAxis />
    </LineChart>
  )
}

export default RewardCalculatorChart
