import React from 'react'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'

import WatchOnlyAddContainer from '../containers/WatchOnlyAddContainer'
import WatchOnlyViewContainer from '../containers/WatchOnlyViewContainer'

import uuid from 'node-uuid'

const WatchOnly = ({ addresses, byAddress, localCurrency, rate, toggleEdit }) => {
  const onCellClick = (rowNumber, columndId) => {
    toggleEdit(byAddress[addresses[rowNumber]].address)
  }

  return (
    <div style={{marginTop:'6px'}}>
      <WatchOnlyAddContainer />
      <WatchOnlyViewContainer />

      <Table height="265px" fixedHeader={true} showCheckboxes={false} onCellClick={onCellClick}>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn style={{fontSize:'13px', width:'60%'}}>Watch-only addresses</TableHeaderColumn>
            <TableHeaderColumn style={{fontSize:'13px', width:'20%'}}>Balance</TableHeaderColumn>
            <TableHeaderColumn style={{fontSize:'13px', width:'20%'}}>{localCurrency}</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody showRowHover={true} stripedRows={true} displayRowCheckbox={false}>
          {
            addresses.map((address) => (
              <TableRow key={uuid.v4()} displayBorder={false}>
                <TableRowColumn style={{width:'60%'}} className='font-mono'>{byAddress[address].address}</TableRowColumn>
                <TableRowColumn style={{textAlign:'right', width:'20%'}}>{parseFloat(byAddress[address].balance).toFixed(6)}</TableRowColumn>
                <TableRowColumn style={{textAlign:'right', width:'20%'}}>{parseFloat(byAddress[address].balance * rate).toFixed(2) + ' ' + localCurrency}</TableRowColumn>
              </TableRow>
            ))
          }
        </TableBody>
      </Table>
    </div>
  )
}

export default WatchOnly
