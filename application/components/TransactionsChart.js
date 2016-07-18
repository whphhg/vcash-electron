import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

const TransactionsChart = ({ chartData }) => {
  process.env.NODE_ENV === 'development' && console.log('%c' + '<TransactionsChart />', 'color:#673AB7')
  return (
    <LineChart width={1100} height={300} data={chartData} margin={{top:30, right:38}}>
      <CartesianGrid stroke="#ccc" strokeDasharray="6 6" />
      <Line type="monotone" dataKey='send' stroke="#b60127" />
      <Line type="monotone" dataKey='generate' stroke="#1A237E" />
      <Line type="monotone" dataKey='receive' stroke="#33691E" />
      <Tooltip />
      <XAxis dataKey='date' />
      <YAxis />
    </LineChart>
  )
}

export default TransactionsChart
