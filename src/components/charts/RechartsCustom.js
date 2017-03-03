import React from 'react'
import { Col, Row } from 'antd'
import i18next from '../../utilities/i18next'
import moment from 'moment'

/** Required stores. */
import ui from '../../stores/ui'

/**
 * Custom axis tick.
 * @function CustomTick
 */
const CustomTick = (props) => {
  let value = ''

  switch (props.textType) {
    case 'date':
      value = new Date(props.payload.value)
        .toLocaleDateString(ui.language, {
          day: '2-digit',
          month: '2-digit'
        })
      break

    case 'time':
      value = moment(props.payload.value)
        .subtract(1, 'hour')
        .format('LT')
      break

    default:
      value = props.payload.value
      break
  }

  return (
    <g transform={`translate(${props.x},${props.y})`}>
      <text
        x={props.textX}
        y={props.textY}
        fill='#666666'
        textAnchor='end'
      >
        {value}
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

  switch (props.tooltipType) {
    case 'rewardSpread':
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

    default:
      const amounts = props.amounts || false

      return (
        <div className='chartTooltip'>
          <p className='label'>
            {i18next.t('wallet:statisticsFor')} {moment(props.label).format('L')}
          </p>
          <Row>
            {
              props.payload.map((entry) => {
                return (
                  <div key={entry.color + entry.name}>
                    <Col span={12}>
                      <p style={{color: entry.color}}>
                        {i18next.t('wallet:' + entry.name)}
                      </p>
                    </Col>
                    <Col span={12} className='text-right'>
                      <p style={{color: entry.color}}>
                        {
                          props.amounts === true && (
                            new Intl.NumberFormat(ui.language, {
                              minimumFractionDigits: 6,
                              maximumFractionDigits: 6
                            }).format(entry.value) + ' XVC'
                          )
                        }
                        {
                          amounts === false && entry.value
                        }
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

export { CustomTick, CustomTooltip }
