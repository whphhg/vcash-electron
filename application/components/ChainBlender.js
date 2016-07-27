import React from 'react'
import { inject, observer } from 'mobx-react'
import Toggle from 'material-ui/Toggle'

@inject('chainBlender')
@inject('wallet')
@observer

class ChainBlender extends React.Component {
  constructor(props) {
    super(props)
    this.chainBlender = props.chainBlender
    this.wallet = props.wallet
  }

  toggle() {
    this.chainBlender.toggle()
  }

  render() {
    return (
      <div>
        <div style={{minHeight: '240px'}}>
          <div className='row' style={{marginTop:'30px'}}>
            <div className='col-md-12'>
              <Toggle
                label="ChainBlender"
                toggled={this.chainBlender.isActivated}
                onToggle={this.toggle.bind(this)}
                disabled={this.wallet.isLocked}
              />
            </div>
          </div>
          {
            !this.wallet.isLocked &&
            (
              <div className='row' style={{marginTop:'30px'}}>
                <div className='col-md-5'>
                  <p>Blend state</p>
                  <p>Balance</p>
                  <p>Denominated</p>
                  <p>Non-denominated</p>
                  <p>Blended</p>
                  <p>Blended percent</p>
                </div>
                <div className='col-md-7 text-right'>
                  <h5>{this.chainBlender.blendstate}</h5>
                  <h5>{this.chainBlender.balance.toFixed(6)} XVC</h5>
                  <h5>{this.chainBlender.denominatedbalance.toFixed(6)} XVC</h5>
                  <h5>{this.chainBlender.nondenominatedbalance.toFixed(6)} XVC</h5>
                  <h5>{this.chainBlender.blendedbalance.toFixed(6)} XVC</h5>
                  <h5>{this.chainBlender.blendedpercentage.toFixed(2)}%</h5>
                </div>
              </div>
            )
          }
        </div>
      </div>
    )
  }
}

export default ChainBlender
