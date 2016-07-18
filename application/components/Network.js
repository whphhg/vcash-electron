import React from 'react'
import Paper from 'material-ui/Paper'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'
import { Tab, Tabs } from 'material-ui/Tabs'

import AddressIcon from 'material-ui/svg-icons/av/library-books'
import AddressIpIcon from 'material-ui/svg-icons/hardware/computer'
import BlockhashIcon from 'material-ui/svg-icons/action/extension'
import CollateralIcon from 'material-ui/svg-icons/action/loyalty'
import PeersIcon from 'material-ui/svg-icons/action/settings-input-antenna'
import PortIcon from 'material-ui/svg-icons/av/hearing'
import VerifiedUserIcon from 'material-ui/svg-icons/action/verified-user'

import NetworkGeoMapContainer from '../containers/NetworkGeoMapContainer'
import RewardCalculatorChartContainer from '../containers/RewardCalculatorChartContainer'
import RewardCalculatorContainer from '../containers/RewardCalculatorContainer'

import moment from 'moment'
import uuid from 'node-uuid'

const Network = ({ state, incentive, blocks }) => {
  process.env.NODE_ENV === 'development' && console.log('%c' + '<Network />', 'color:#673AB7')
  return (
    <div>
      <NetworkGeoMapContainer />

      <div className='container-fluid'>
        <div className='row'>
          <Tabs inkBarStyle={{background:'#FFFFFF'}}>
            <Tab label='Network information'>
              <div className='col-md-4'>
                <h5>Connection information</h5>
                <AddressIpIcon style={{height:'20px',float:'left'}}/>
                <p style={{float:'left',paddingLeft:'8px',margin:'0px'}}>
                  Your IP address is <span className='font-weight-500'>{state.ip}</span>
                </p>
                <div style={{clear:'both'}}></div>

                <PortIcon style={{height:'20px',float:'left'}}/>
                <p style={{float:'left',paddingLeft:'8px',margin:'0px'}}>
                  Listening on <span className='font-weight-500'>{incentive.networkStatus === 'ok' ? 'open' : 'closed'}</span> port <span className='font-weight-500'>{state.port}</span>
                </p>
                <div style={{clear:'both'}}></div>

                <PeersIcon style={{height:'20px',float:'left'}}/>
                <p style={{float:'left',paddingLeft:'8px',margin:'0px'}}>
                  <span className='font-weight-500'>{state.tcp} TCP</span> and <span className='font-weight-500'>{state.udp} UDP</span> connections
                </p>
                <div style={{clear:'both'}}></div>

                <BlockhashIcon style={{height:'20px',float:'left'}}/>
                <p style={{float:'left',paddingLeft:'8px',margin:'0px'}}>
                  On block <span className='font-weight-500'>#{blocks}</span>
                </p>
                <div style={{clear:'both'}}></div>

                <h5 style={{marginTop:'20px'}}>Incentive information</h5>
                <AddressIcon style={{height:'20px',float:'left'}}/>
                <p style={{float:'left',paddingLeft:'8px',margin:'0px'}}>
                  Address <span className='font-weight-500'>{incentive.walletAddress === '' ? 'will be revealed after unlocking' : incentive.walletAddress}</span>
                </p>
                <div style={{clear:'both'}}></div>

                <CollateralIcon style={{height:'20px',float:'left'}}/>
                <p style={{float:'left',paddingLeft:'8px',margin:'0px'}}>
                  Valid collateral <span className="font-weight-500">{incentive.voteCandidate === true ? 'of ' + incentive.collateralBalance :'not'}</span> detected
                </p>
                <div style={{clear:'both'}}></div>

                <VerifiedUserIcon style={{height:'20px',float:'left'}}/>
                <p style={{float:'left',paddingLeft:'8px',margin:'0px'}}>
                  <span className='font-weight-500'>You {incentive.voteCandidate === true ? 'are' : 'are not'}</span> a vote candidate</p>
                <div style={{clear:'both'}}></div>
              </div>
              <div className='col-md-8' style={{marginTop:'10px'}}>
                <Table height="192px" fixedHeader={true} showCheckboxes={false}>
                  <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                    <TableRow style={{fontSize:'13px'}}>
                      <TableHeaderColumn style={{width:'21%'}}>Connected peers</TableHeaderColumn>
                      <TableHeaderColumn style={{width:'18%'}}>Country</TableHeaderColumn>
                      <TableHeaderColumn style={{width:'22%'}}>Version and OS</TableHeaderColumn>
                      <TableHeaderColumn style={{width:'17%'}}>Connected</TableHeaderColumn>
                      <TableHeaderColumn style={{width:'13%'}}>Starting height</TableHeaderColumn>
                      <TableHeaderColumn style={{width:'9%'}}>Ban score</TableHeaderColumn>
                    </TableRow>
                  </TableHeader>
                  <TableBody showRowHover={true} stripedRows={true} displayRowCheckbox={false}>
                    {
                      state.nodes.connected.map((peer) => (
                        <TableRow key={uuid.v4()} displayBorder={false}>
                          <TableRowColumn style={{width:'21%'}}>{peer.addr}</TableRowColumn>
                          <TableRowColumn style={{width:'18%'}}>{peer.country}</TableRowColumn>
                          <TableRowColumn style={{width:'22%'}}>{peer.subverClean} on {peer.os}</TableRowColumn>
                          <TableRowColumn style={{width:'17%'}}>{moment(peer.conntime).fromNow()}</TableRowColumn>
                          <TableRowColumn style={{width:'13%'}}>{peer.startingheight}</TableRowColumn>
                          <TableRowColumn style={{width:'9%'}}>{peer.banscore}/100</TableRowColumn>
                        </TableRow>
                      ))
                    }
                  </TableBody>
                </Table>
              </div>
            </Tab>
            <Tab label='Block reward calculator'>
              <div className='col-md-4'>
                <RewardCalculatorContainer />
              </div>
              <div className='col-md-8'>
                <RewardCalculatorChartContainer />
              </div>
            </Tab>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default Network
