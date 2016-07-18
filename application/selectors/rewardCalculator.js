import { createSelector } from 'reselect'
import { calculateIncentive, calculatePoW } from '../utilities/calculateBlockRewards'

const getBlock = (state) => state.ui.rewardCalculator.block
const getBlocks = (state) => state.wallet.info.blocks

export const getChartData = createSelector([getBlock, getBlocks], (block, blocks) => {
  const blockHeight = block === '' ? parseInt(blocks) : parseInt(block)
  let data = []

  for (let i = blockHeight; i <= blockHeight + 100000; i += 2500) {
    const powPercent = calculateIncentive(i)
    const powReward = calculatePoW(i)
    const incentiveReward = (powReward / 100) * powPercent

    data.push({
      block: i,
      'Incentive share': parseFloat(parseFloat(incentiveReward).toFixed(6)),
      'Miner share': parseFloat(parseFloat(powReward - incentiveReward).toFixed(6)),
      'PoW reward': parseFloat(parseFloat(powReward.toFixed(6)))
    })
  }

  return data
})
