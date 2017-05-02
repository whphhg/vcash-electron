import React from 'react'
import { translate } from 'react-i18next'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

export default class Welcome extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
  }

  render () {
    return (
      <div style={{textAlign: 'center'}}>
        <div style={{bottom: '150px', left: 0, position: 'fixed', right: 0}}>
          <div className='circlingLogo' />
        </div>
        <div
          className='flex-sb shadow'
          style={{bottom: 0, height: '50px', position: 'fixed', width: '100%'}}
        >
          <div style={{width: '300px'}}>
            <i className='material-icons md-16'>arrow_back</i>
            <p><b>Alt-a</b> &nbsp; {this.t('wallet:connectionPrevious')}</p>
          </div>
          <div style={{width: '300px'}}>
            <i className='material-icons md-16'>cast_connected</i>
            <p><b>Alt-s</b> &nbsp; {this.t('wallet:connectionManager')}</p>
          </div>
          <div style={{width: '300px'}}>
            <i className='material-icons md-16'>arrow_forward</i>
            <p><b>Alt-d</b> &nbsp; {this.t('wallet:connectionNext')}</p>
          </div>
        </div>
      </div>
    )
  }
}
