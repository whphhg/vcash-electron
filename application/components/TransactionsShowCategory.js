import React from 'react'
import { render } from 'react-dom'
import MenuItem from 'material-ui/MenuItem'
import SelectField from 'material-ui/SelectField'

const TransactionsShowCategory = ({ showCategory, setCategory }) => {
  process.env.NODE_ENV === 'development' && console.log('%c' + '<TransactionsShowCategory />', 'color:#673AB7')
  return (
    <div>
      <SelectField onChange={setCategory} value={showCategory} autoWidth={true} floatingLabelText='Showing' style={{width:'150px'}}>
        <MenuItem key={1} value='all' primaryText='All' />
        <MenuItem key={2} value='receive' primaryText='Received' />
        <MenuItem key={3} value='send' primaryText='Sent' />
        <MenuItem key={4} value='blended' primaryText='Blended' />
        <MenuItem key={5} value='generate' primaryText='Generated' />
        <MenuItem key={6} value='immature' primaryText='Immature' />
      </SelectField>
    </div>
  )
}

export default TransactionsShowCategory
