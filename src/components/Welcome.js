import React from 'react'
import { translate } from 'react-i18next'

/**
 * Welcome screen component.
 */
@translate(['wallet'], { wait: true })
class Welcome extends React.Component {
  render = () =>
    <div id='Welcome'>
      <div>
        <div className='circlingLogo' />
      </div>
      <div className='flex-sb shadow'>
        <div>
          <i className='material-icons md-16'>arrow_back</i>
          <p>
            <b>Alt-a</b> &nbsp; {this.props.t('wallet:connPrevious')}
          </p>
        </div>
        <div>
          <i className='material-icons md-16'>cast_connected</i>
          <p>
            <b>Alt-s</b> &nbsp; {this.props.t('wallet:connManager')}
          </p>
        </div>
        <div>
          <i className='material-icons md-16'>arrow_forward</i>
          <p>
            <b>Alt-d</b> &nbsp; {this.props.t('wallet:connNext')}
          </p>
        </div>
      </div>
    </div>
}

export default Welcome
