import React from 'react'
import { translate } from 'react-i18next'
import { action } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Switch } from 'antd'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('ui', 'wallet') @observer

export default class ChainBlender extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.ui = props.ui
    this.wallet = props.wallet
  }

  /**
   * Toggle ChainBlender.
   * @function toggle
   */
  @action toggle = () => {
    this.wallet.toggleBlender()
  }

  render () {
    const { chainBlender, isBlending, isLocked } = this.wallet

    return (
      <div>
        <Switch
          size='small'
          checked={isBlending === true}
          disabled={isLocked === true}
          onChange={this.toggle}
          checkedChildren={
            <i
              className='material-icons md-16'
              style={{margin: '-2px 0 0 0'}}
            >
              done
            </i>
          }
          unCheckedChildren={
            <i
              className='material-icons md-16'
              style={{margin: '-2px 0 0 0'}}
            >
              clear
            </i>
          }
        />
        <p
          style={{
            margin: '0 0 0 11px',
            verticalAlign: '-1px'
          }}
        >
          {this.t('wallet:blended')}
          <span> {
              new Intl.NumberFormat(this.ui.language, {
                minimumFractionDigits: 6,
                maximumFractionDigits: 6
              }).format(chainBlender.blendedbalance)
            }
          </span> XVC (
          <span>
            {
              new Intl.NumberFormat(this.ui.language, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }).format(chainBlender.blendedpercentage)
            }
          </span>%)
        </p>
        {
          this.wallet.isLocked === false && (
            <p
              style={{
                margin: '0 0 0 11px',
                verticalAlign: '-1px'
              }}
            >
              {this.t('wallet:denominated')}
              <span> {
                  new Intl.NumberFormat(this.ui.language, {
                    minimumFractionDigits: 6,
                    maximumFractionDigits: 6
                  }).format(chainBlender.denominatedbalance)
                }
              </span> XVC
            </p>
          )
        }
      </div>
    )
  }
}
