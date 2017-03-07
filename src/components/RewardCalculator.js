import React from 'react'
import { translate } from 'react-i18next'
import { action, computed, observable } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Col, Input, Row } from 'antd'
import { calculateIncentive, calculatePoW } from '../utilities/blockRewards'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('ui', 'wallet') @observer

export default class RewardCalculator extends React.Component {
  @observable enteredBlock = ''

  constructor (props) {
    super(props)
    this.t = props.t
    this.ui = props.ui
    this.wallet = props.wallet
  }

  /**
   * Get block.
   * @function block
   * @return {number} Entered or current block.
   */
  @computed get block () {
    return this.enteredBlock.length === 0
      ? this.wallet.info.blocks
      : Math.round(this.enteredBlock)
  }

  /**
   * Get proof-of-work reward.
   * @function powReward
   * @return {number} Reward.
   */
  @computed get powReward () {
    return calculatePoW(this.block)
  }

  /**
   * Get incentive percent of PoW reward.
   * @function incentivePercent
   * @return {number} Percent.
   */
  @computed get incentivePercent () {
    return calculateIncentive(this.block)
  }

  /**
   * Get mining share.
   * @function miningReward
   * @return {number} Reward.
   */
  @computed get miningReward () {
    return this.powReward - this.incentiveReward
  }

  /**
   * Get incentive share.
   * @function incentiveReward
   * @return {number} Reward.
   */
  @computed get incentiveReward () {
    return (this.powReward / 100) * this.incentivePercent
  }

  /**
   * Set block.
   * @function setBlock
   * @param {object} e - Input element event.
   */
  @action setBlock = (e) => {
    const block = e === undefined
      ? ''
      : e.target.value

    if (block.toString().match(/^[0-9]{0,7}$/) !== null) {
      this.enteredBlock = block
    }
  }

  render () {
    return (
      <div>
        <Row
          style={{
            margin: '0 0 27px 0',
            width: '300px'
          }}
        >
          <Col span={2}>
            <i className='material-icons md-18'>extension</i>
          </Col>
          <Col span={5}>
            {this.t('wallet:block')}
          </Col>
          <Col span={5}>
            <Input
              placeholder={this.block}
              value={this.enteredBlock}
              onChange={this.setBlock}
              maxLength={7}
              size='small'
            />
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <Row>
              <Col span={24}>
                {this.t('wallet:powReward')}
              </Col>
              <Col span={24}>
                <span style={{fontWeight: '500'}}>
                  {
                    new Intl.NumberFormat(this.ui.language, {
                      minimumFractionDigits: 6,
                      maximumFractionDigits: 6
                    }).format(this.powReward)
                  }
                </span> XVC
              </Col>
            </Row>
          </Col>
          <Col span={8}>
            <Row>
              <Col span={24}>
                {this.t('wallet:miningReward')}
              </Col>
              <Col span={24}>
                <span style={{fontWeight: '500'}}>
                  {
                    new Intl.NumberFormat(this.ui.language, {
                      minimumFractionDigits: 6,
                      maximumFractionDigits: 6
                    }).format(this.miningReward)
                  }
                </span> XVC ({100 - this.incentivePercent}%)
              </Col>
            </Row>
          </Col>
          <Col span={8}>
            <Row>
              <Col span={24}>
                {this.t('wallet:incentiveReward')}
              </Col>
              <Col span={24}>
                <span style={{fontWeight: '500'}}>
                  {
                    new Intl.NumberFormat(this.ui.language, {
                      minimumFractionDigits: 6,
                      maximumFractionDigits: 6
                    }).format(this.incentiveReward)
                  }
                </span> XVC ({this.incentivePercent}%)
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    )
  }
}
