import React from 'react'
import Toggle from 'material-ui/Toggle'

const ChainBlender = ({ state, isLocked, toggleBlender }) => {
  const info = (
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
        <h5>{state.blendState}</h5>
        <h5>{state.balance.toFixed(6)} XVC</h5>
        <h5>{state.denominatedBalance.toFixed(6)} XVC</h5>
        <h5>{state.nonDenominatedBalance.toFixed(6)} XVC</h5>
        <h5>{state.blendedBalance.toFixed(6)} XVC</h5>
        <h5>{state.blendedPercentage.toFixed(2)}%</h5>
      </div>
    </div>
  )

  process.env.NODE_ENV === 'development' && console.log('%c' + '<ChainBlender />', 'color:#673AB7')
  return (
    <div>
      <div style={{ minHeight: '240px' }}>
        <div className='row' style={{marginTop:'30px'}}>
          <div className='col-md-12'>
            <Toggle
              label="ChainBlender"
              toggled={state.isActivated}
              onToggle={toggleBlender}
              disabled={isLocked}
            />
          </div>
        </div>
        { !isLocked && info }
      </div>
    </div>
  )
}

export default ChainBlender
