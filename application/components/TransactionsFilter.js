import React from 'react'
import { render } from 'react-dom'
import TextField from 'material-ui/TextField'

const TransactionsFilter = ({ filterBy, setFilter }) => {
  let timer

  const onChange = (event) => {
    const filter = event.target.value
    clearTimeout(timer)

    timer = setTimeout(() => {
      setFilter(filter)
    }, 0.5 * 1000)
  }

  process.env.NODE_ENV === 'development' && console.log('%c' + '<TransactionsFilter />', 'color:#673AB7')
  return (
    <TextField
      hintText='by blockhash, txid or any of the columns below'
      style={{width:'350px'}}
      floatingLabelStyle={{fontWeight:'normal'}}
      floatingLabelText='Filter transactions'
      onChange={onChange}
    />
  )
}

export default TransactionsFilter
