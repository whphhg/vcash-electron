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
          <Row
            style={{
              bottom: 0,
              height: '25px',
              position: 'fixed',
              textAlign: 'center',
              width: '100%'
            }}
          >
            <Col span={8}>
              <b>Shift-a</b> &nbsp; {this.t('wallet:connectionPrevious')}
            </Col>
            <Col span={8}>
              <b>Shift-s</b> &nbsp; {this.t('wallet:connectionManager')}
            </Col>
            <Col span={8}>
              <b>Shift-d</b> &nbsp; {this.t('wallet:connectionNext')}
            </Col>
          </Row>
        </div>
      </div>
    )
  }
}
