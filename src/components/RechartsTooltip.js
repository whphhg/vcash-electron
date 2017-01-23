import React from 'react'
import { inject, observer } from 'mobx-react'
import { Col, Row } from 'antd'

/** Make the component reactive and inject MobX stores. */
@inject('ui') @observer

class RechartsTooltip extends React.Component {
  constructor (props) {
    super(props)
    this.ui = props.ui
  }

  render () {
    if (this.props.active === false) return null
    return (
      <div className='chartTooltip'>
        <p className='label'>
          {this.props.labelText} {this.props.label}
        </p>
        <Row>
          {
            this.props.payload.map((entry) => {
              return (
                <div key={entry.color + entry.name}>
                  <Col span={12}>
                    <p style={{color: entry.color}}>
                      {entry.name}
                    </p>
                  </Col>
                  <Col span={12} className='text-right'>
                    <p style={{color: entry.color}}>
                      {
                        new Intl.NumberFormat(this.ui.language, {
                          minimumFractionDigits: 6,
                          maximumFractionDigits: 6
                        }).format(entry.value)
                      } XVC
                    </p>
                  </Col>
                </div>
              )
            })
          }
        </Row>
      </div>
    )
  }
}

export default RechartsTooltip
