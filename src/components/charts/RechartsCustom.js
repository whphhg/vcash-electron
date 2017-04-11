import React from 'react'
import { Col, Row } from 'antd'
import { humanReadable } from '../../utilities/common'
import i18next from '../../utilities/i18next'
import moment from 'moment'

/** Required stores. */
import gui from '../../stores/gui'

/**
 * Custom axis tick.
 * @function CustomTick
 */
const CustomTick = (props) => {
  let value = ''

  switch (props.textType) {
    case 'date':
      value = new Date(props.payload.value)
        .toLocaleDateString(gui.language, {
          day: '2-digit',
          month: '2-digit'
        })
      break

    case 'time':
      value = moment(props.payload.value).format('LT')
      break

    case 'hashRate':
      value = humanReadable(props.payload.value, true, 'H/s')
      break

    case 'number':
      value = new Intl.NumberFormat(gui.language, {
        maximumFractionDigits: 2
      }).format(props.payload.value)
      break

    default:
      value = props.payload.value
      break
  }

  return (
    <g transform={`translate(${props.x},${props.y})`}>
      <text
        x={props.textX || 0}
        y={props.textY || 0}
        fill='#666666'
        textAnchor={props.textAnchor || 'end'}
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
            <Col span={18} style={{textAlign: 'right'}}>
              <p style={{color: color}}>
                {
                  new Intl.NumberFormat(gui.language, {
                    minimumFractionDigits: 6,
                    maximumFractionDigits: 6
                  }).format(amount)
                } XVC
              </p>
              <p>{moment(date).format('L - LTS')}</p>
            </Col>
          </Row>
        </div>
      )

    default:
      return (
        <div className='chartTooltip'>
          <p className='label'>
            {i18next.t('wallet:statisticsFor') + ' '}
            {
              props.labelTime === true
                ? moment(props.label).format('LT')
                : moment(props.label).format('L')
            }
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
                    <Col span={12} style={{textAlign: 'right'}}>
                      <p style={{color: entry.color}}>
                        {
                          (
                            props.hashRate === true && (
                              humanReadable(entry.value, true, 'H/s')
                            )
                          ) || (
                            props.amounts === true && (
                              new Intl.NumberFormat(gui.language, {
                                minimumFractionDigits: 6,
                                maximumFractionDigits: 6
                              }).format(entry.value) + ' XVC'
                            )
                          ) || (
                            props.amounts !== true && (
                              new Intl.NumberFormat(gui.language, {
                                maximumFractionDigits: 2
                              }).format(entry.value)
                            )
                          )
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
