/**
 * Get incentive percent of PoW reward for provided block.
 * @function calculateIncentive
 * @param {number} block - Block to retrieve the reward percent of.
 * @return {number} Incentive percent of PoW reward.
 */
export const calculateIncentive = (block) => {
  const percents = incentivePercents()
  const percentsLen = percents.length - 1

  if (block >= percents[percentsLen].block) {
    return percents[percentsLen].percent
  }

  for (let i in percents) {
    if (block < percents[i].block) {
      return percents[i].percent - 1
    }
  }
}

/**
 * Get PoW reward for provided block.
 * @function calculatePoW
 * @param {number} block - Block to calculate the PoW reward of.
 * @return {number} PoW reward.
 * @see {@link https://github.com/john-connor/vcash/blob/master/src/reward.cpp|GitHub}
 */
export const calculatePoW = (block) => {
  let subsidy = 0

  if (block >= 136400 && block <= 136400 + 1000) {
    subsidy = 1
  } else {
    subsidy = 128 * 1000000

    if (block < 325000) {
      for (let i = 50000; i <= block; i += 50000) {
        subsidy -= subsidy / 6
      }
    } else if (block < 385000) {
      for (let i = 10000; i <= block; i += 10000) {
        subsidy -= subsidy / 28
        subsidy = Math.ceil(subsidy)
        subsidy -= (subsidy / 28 * 4) / 28
        subsidy = Math.ceil(subsidy)
      }
    } else {
      for (let i = 7000; i <= block; i += 7000) {
        subsidy -= subsidy / 28
        subsidy = Math.ceil(subsidy)
        subsidy -= (subsidy / 28 * 4) / 28
        subsidy = Math.ceil(subsidy)
      }
    }

    if ((subsidy / 1000000) < 1) {
      subsidy = 1
      subsidy *= 1000000
    }
  }

  return subsidy / 1000000
}

/**
 * Get incentive reward percent schedule.
 * @function incentivePercents
 * @return {array} Reward schedule.
 * @see {@link https://gist.github.com/john-connor/967ba7f7e9dd0ec1f7a9|GitHub Gist}
 */
export const incentivePercents = () => {
  return [
    { block: 210100, percent: 1 },
    { block: 220100, percent: 2 },
    { block: 220300, percent: 3 },
    { block: 220900, percent: 4 },
    { block: 222000, percent: 5 },
    { block: 223600, percent: 6 },
    { block: 225600, percent: 7 },
    { block: 228000, percent: 8 },
    { block: 230900, percent: 9 },
    { block: 234300, percent: 10 },
    { block: 238000, percent: 11 },
    { block: 242300, percent: 12 },
    { block: 246900, percent: 13 },
    { block: 252000, percent: 14 },
    { block: 257600, percent: 15 },
    { block: 263600, percent: 16 },
    { block: 270000, percent: 17 },
    { block: 276900, percent: 18 },
    { block: 284200, percent: 19 },
    { block: 292000, percent: 20 },
    { block: 300200, percent: 21 },
    { block: 308900, percent: 22 },
    { block: 318000, percent: 23 },
    { block: 327500, percent: 24 },
    { block: 337500, percent: 25 },
    { block: 347900, percent: 26 },
    { block: 358800, percent: 27 },
    { block: 370100, percent: 28 },
    { block: 381900, percent: 29 },
    { block: 394100, percent: 30 },
    { block: 406800, percent: 31 },
    { block: 419900, percent: 32 },
    { block: 433400, percent: 33 },
    { block: 447400, percent: 34 },
    { block: 461800, percent: 35 },
    { block: 476700, percent: 36 },
    { block: 492000, percent: 37 }
  ]
}
