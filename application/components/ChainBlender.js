import React from 'react'
import { inject, observer } from 'mobx-react'
import { Switch } from 'react-mdl'

@inject('chainBlender')
@inject('wallet')
@observer

class ChainBlender extends React.Component {
  constructor(props) {
    super(props)
    this.chainBlender = props.chainBlender
    this.wallet = props.wallet
    this.toggle = this.toggle.bind(this)
  }

  toggle() {
    this.chainBlender.toggle()
  }

  render() {
    return (
      <div>
        <div style={{float:'left'}}>
          <Switch checked={this.chainBlender.isActivated} disabled={this.wallet.isLocked} onChange={this.toggle}>ChainBlender</Switch>
        </div>

        {
          !this.wallet.isLocked &&
          (
            <div style={{float:'left', marginLeft:'40px'}}>
              <p>Blended balance <span>{this.chainBlender.blendedbalance.toFixed(6)}</span> XVC (<span>{this.chainBlender.blendedpercentage.toFixed(2)}</span>%)</p>
            </div>
          )
        }

        <div style={{clear:'both'}}></div>
      </div>
    )
  }
}

export default ChainBlender
