import React from 'react'
import { translate } from 'react-i18next'

@translate(['wallet'], { wait: true })
class Welcome extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
  }

  render () {
    return (
      <div id='Welcome'>
        <div>
          <div className='circlingLogo' />
        </div>
        <div className='flex-sb shadow'>
          <div>
            <i className='material-icons md-16'>arrow_back</i>
            <p>
              <b>Alt-a</b> &nbsp; {this.t('wallet:connPrevious')}
            </p>
          </div>
          <div>
            <i className='material-icons md-16'>cast_connected</i>
            <p>
              <b>Alt-s</b> &nbsp; {this.t('wallet:connManager')}
            </p>
          </div>
          <div>
            <i className='material-icons md-16'>arrow_forward</i>
            <p>
              <b>Alt-d</b> &nbsp; {this.t('wallet:connNext')}
            </p>
          </div>
        </div>
      </div>
    )
  }
}

export default Welcome
