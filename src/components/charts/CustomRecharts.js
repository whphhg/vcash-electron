import React from 'react'
import { humanReadable } from '../../utilities/common'
import i18next from '../../utilities/i18next'
import moment from 'moment'

/**
 * Custom axis tick.
 * @function CustomTick
 */
export const CustomTick = props => {
  let value = ''

  switch (props.textType) {
    case 'date':
      value = new Date(props.payload.value).toLocaleDateString(props.language, {
        day: '2-digit',
        month: '2-digit'
      })
      break

    case 'time':
      value = moment(props.payload.value).format('LT')
      break

    case 'hashRate':
      value = humanReadable(props.payload.value, true, 'H/s', props.language)
      break

    case 'number':
      value = new Intl.NumberFormat(props.language, {
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
        fill="#666666"
        textAnchor={props.textAnchor || 'end'}
        x={props.textX || 0}
        y={props.textY || 0}
      >
        {value}
      </text>
    </g>
  )
}

/**
 * Custom tooltip.
 * @function CustomTooltip
 */
export const CustomTooltip = props => {
  if (props.active === false) return null

  switch (props.tooltipType) {
    case 'rewardSpread':
      const { amount, category, color, date } = props.payload[0].payload
      return (
        <div className="chartTooltip">
          <p className="label">{i18next.t(category)}</p>
          <div className="flex-sb">
            <div style={{ margin: '0 32px 0 0' }}>
              <p>{i18next.t('amount')}</p>
              <p>{i18next.t('date')}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color }}>
                {new Intl.NumberFormat(props.language, {
                  minimumFractionDigits: 6,
                  maximumFractionDigits: 6
                }).format(amount)}{' '}
                XVC
              </p>
              <p>{moment(date).format('L - LTS')}</p>
            </div>
          </div>
        </div>
      )

    default:
      return (
        <div className="chartTooltip">
          <p className="label">
            {i18next.t('statisticsFor')}{' '}
            {props.labelTime === true
              ? moment(props.label).format('LT')
              : moment(props.label).format('L')}
          </p>
          {props.payload.map(entry => {
            return (
              <div className="flex-sb" key={entry.color + entry.name}>
                <p style={{ color: entry.color, margin: '0 72px 0 0' }}>
                  {i18next.t(entry.name)}
                </p>
                <p style={{ color: entry.color }}>
                  {(props.hashRate === true &&
                    humanReadable(entry.value, true, 'H/s', props.language)) ||
                    (props.amounts === true &&
                      new Intl.NumberFormat(props.language, {
                        minimumFractionDigits: 6,
                        maximumFractionDigits: 6
                      }).format(entry.value) + ' XVC') ||
                    (props.amounts !== true &&
                      new Intl.NumberFormat(props.language, {
                        maximumFractionDigits: 2
                      }).format(entry.value))}
                </p>
              </div>
            )
          })}
        </div>
      )
  }
}
