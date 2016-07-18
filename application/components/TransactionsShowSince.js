import React from 'react'
import { render } from 'react-dom'
import DatePicker from 'material-ui/DatePicker'

const TransactionsShowSince = ({ showSince, setShowSince }) => {
  process.env.NODE_ENV === 'development' && console.log('%c' + '<TransactionsShowSince />', 'color:#673AB7')
  return (
    <DatePicker
      textFieldStyle={{width:'150px'}}
      hintText='Show transactions since'
      container='inline'
      mode='landscape'
      defaultDate={showSince}
      maxDate={new Date()}
      onChange={setShowSince}
    />
  )
}

export default TransactionsShowSince
