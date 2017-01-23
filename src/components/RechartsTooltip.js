import React from 'react'
import { Col, Row } from 'antd'

/** Required stores. */
import ui from '../stores/ui'

/** Custom Recharts tooltip. */
const RechartsTooltip = (props) => {
  if (props.active === false) return null
  return (
    <div className='chartTooltip'>
      <p className='label'>
        {props.labelText} {props.label}
      </p>
      <Row>
        {
          props.payload.map((entry) => {
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
                      new Intl.NumberFormat(ui.language, {
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

export default RechartsTooltip
