import React from 'react'
import { Col, Row } from 'antd'
import i18next from '../../utilities/i18next'
import moment from 'moment'

/** Required stores. */
import ui from '../../stores/ui'

/**
 * Transaction statistics x axis tick.
 * @function CustomTickX
 */
const CustomTickX = (props) => {
  return (
    <g transform={`translate(${props.x},${props.y})`}>
      <text
        x={1}
        y={15}
        fill='#666666'
        textAnchor='end'
      >
        {props.payload.value}
      </text>
    </g>
  )
}

/**
 * Transaction statistics tooltip.
 * @function CustomTooltip
 */
const CustomTooltip = (props) => {
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

/**
 * Scatter chart x axis tick.
 * @function ScatterTickX
 */
const ScatterTickX = (props) => {
  return (
    <g transform={`translate(${props.x},${props.y})`}>
      <text
        x={18}
        y={15}
        fill='#666666'
        textAnchor='end'
      >
        {
          new Date(props.payload.value)
            .toLocaleDateString(ui.language, {
              day: '2-digit',
              month: '2-digit'
            })
        }
      </text>
    </g>
  )
}

/**
 * Scatter chart y axis tick.
 * @function ScatterTickY
 */
const ScatterTickY = (props) => {
  return (
    <g transform={`translate(${props.x},${props.y})`}>
      <text
        x={-5}
        y={4}
        fill='#666666'
        textAnchor='end'
      >
        {moment(props.payload.value).subtract(1, 'hour').format('LT')}
      </text>
    </g>
  )
}

/**
 * Scatter chart tooltip.
 * @function ScatterTooltip
 */
const ScatterTooltip = (props) => {
  if (props.active === false) return null
  const { amount, category, color, date } = props.payload[0].payload

  return (
    <div className='chartTooltip'>
      <p className='label'>
        {i18next.t('wallet:' + category)}
      </p>
      <Row>
        <Col span={6}>
          <p>{i18next.t('wallet:amount')}</p>
          <p>{i18next.t('wallet:date')}</p>
        </Col>
        <Col span={18} className='text-right'>
          <p style={{color: color}}>
            {
              new Intl.NumberFormat(ui.language, {
                minimumFractionDigits: 6,
                maximumFractionDigits: 6
              }).format(amount)
            } XVC
          </p>
          <p>{moment(date).format('L HH:mm:ss')}</p>
        </Col>
      </Row>
    </div>
  )
}

export {
  CustomTickX,
  CustomTooltip,
  ScatterTickX,
  ScatterTickY,
  ScatterTooltip
}
