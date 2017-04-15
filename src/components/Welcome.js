import React from 'react'

const Welcome = () => (
  <div
    style={{
      overflow: 'auto',
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }}
  >
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        height: '100%',
        justifyContent: 'center'
      }}
    >
      <div style={{textAlign: 'center'}}>
        <img src='./assets/images/logoRed.png' />
      </div>
    </div>
  </div>
)

export default Welcome
