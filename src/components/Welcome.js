import React from 'react'
import { translate } from 'react-i18next'
import { Col, Row } from 'antd'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

export default class Welcome extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
  }

  render () {
    return (
      <div>
        <div style={{bottom: '110px', position: 'absolute', left: 0, right: 0}}>
          <div className='circlingLogo' />
        </div>
        <footer className='shadow'>
          <Row style={{textAlign: 'center'}}>
            <Col span={8}>
              <i className='material-icons md-16'>arrow_back</i>
              <p><b>Shift-a</b> &nbsp; {this.t('wallet:connectionPrevious')}</p>
            </Col>
            <Col span={8}>
              <i className='material-icons md-16'>cast_connected</i>
              <p><b>Shift-s</b> &nbsp; {this.t('wallet:connectionManager')}</p>
            </Col>
            <Col span={8}>
              <i className='material-icons md-16'>arrow_forward</i>
              <p><b>Shift-d</b> &nbsp; {this.t('wallet:connectionNext')}</p>
            </Col>
          </Row>
        </footer>
      </div>
    )
  }
}
