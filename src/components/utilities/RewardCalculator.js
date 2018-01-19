import React from 'react'
import { translate } from 'react-i18next'
import { action, computed, extendObservable } from 'mobx'
import { inject, observer } from 'mobx-react'
import { incentivePercent, powReward } from '../../utilities/blockRewards.js'

/** Ant Design */
import Input from 'antd/lib/input'

@translate(['common'])
@inject('gui', 'wallet')
@observer
class RewardCalculator extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.wallet = props.wallet

    /** Extend the component with observable properties. */
    extendObservable(this, { enteredBlock: '' })
  }

  /**
   * Get block.
   * @function block
   * @return {number} Entered or current block.
   */
  @computed
  get block() {
    return this.enteredBlock.length === 0
      ? this.wallet.info.blocks
      : Math.round(this.enteredBlock)
  }

  /**
   * Get Proof-of-Work reward.
   * @function powReward
   * @return {number} Reward.
   */
  @computed
  get powReward() {
    return powReward(this.block)
  }

  /**
   * Get incentive percent of PoW reward.
   * @function incentivePercent
   * @return {number} Percent.
   */
  @computed
  get incentivePercent() {
    return incentivePercent(this.block)
  }

  /**
   * Get mining share.
   * @function miningReward
   * @return {number} Reward.
   */
  @computed
  get miningReward() {
    return this.powReward - this.incentiveReward
  }

  /**
   * Get incentive share.
   * @function incentiveReward
   * @return {number} Reward.
   */
  @computed
  get incentiveReward() {
    return this.powReward / 100 * this.incentivePercent
  }

  /**
   * Set block.
   * @function setBlock
   * @param {string} block - Entered block.
   */
  @action
  setBlock = block => {
    if (block.toString().match(/^[0-9]{0,7}$/) !== null) {
      this.enteredBlock = block
    }
  }

  render() {
    return (
      <div className="flex">
        <div style={{ margin: '0 36px 0 0' }}>
          <div className="flex" style={{ margin: '0 0 10px 0' }}>
            <i className="material-icons md-16">extension</i>
            <p>{this.t('block')}</p>
          </div>
          <div className="flex">
            <i className="material-icons md-16">star</i>
            <p>{this.t('powReward')}</p>
          </div>
          <div className="flex">
            <i className="material-icons md-16">developer_board</i>
            <p>{this.t('miningReward')}</p>
          </div>
          <div className="flex">
            <i className="material-icons md-16">event_seat</i>
            <p>{this.t('incentiveReward')}</p>
          </div>
        </div>
        <div style={{ margin: '0 0 2px 0' }}>
          <Input
            onChange={e => this.setBlock(e.target.value)}
            placeholder={this.block}
            size="small"
            style={{ margin: '0 0 10px 0', width: '60px' }}
            value={this.enteredBlock}
          />
          <p>
            <span style={{ fontWeight: '500' }}>
              {new Intl.NumberFormat(this.gui.language, {
                minimumFractionDigits: 6,
                maximumFractionDigits: 6
              }).format(this.powReward)}
            </span>{' '}
            XVC
          </p>
          <p>
            <span style={{ fontWeight: '500' }}>
              {new Intl.NumberFormat(this.gui.language, {
                minimumFractionDigits: 6,
                maximumFractionDigits: 6
              }).format(this.miningReward)}
            </span>{' '}
            XVC ({100 - this.incentivePercent}%)
          </p>
          <p>
            <span style={{ fontWeight: '500' }}>
              {new Intl.NumberFormat(this.gui.language, {
                minimumFractionDigits: 6,
                maximumFractionDigits: 6
              }).format(this.incentiveReward)}
            </span>{' '}
            XVC ({this.incentivePercent}%)
          </p>
        </div>
      </div>
    )
  }
}

export default RewardCalculator
