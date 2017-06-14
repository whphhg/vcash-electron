/**
 * Get incentive percent of PoW reward for provided block.
 * @function calculateIncentive
 * @param {number} block - Block to retrieve the reward percent of.
 * @return {number} Incentive percent of PoW reward.
 */
export const calculateIncentive = block => {
  const percents = incentivePercents()
  const percentsLen = percents.length - 1

  if (block >= percents[percentsLen].block) return percents[percentsLen].percent

  for (let i in percents) {
    if (block < percents[i].block) return percents[i].percent - 1
  }
}

/**
 * Get PoW reward for provided block.
 * @function calculatePoW
 * @param {number} block - Block to calculate the PoW reward of.
 * @return {number} PoW reward.
 */
export const calculatePoW = block => {
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
        subsidy -= subsidy / 28 * 4 / 28
        subsidy = Math.ceil(subsidy)
      }
    } else {
      for (let i = 7000; i <= block; i += 7000) {
        subsidy -= subsidy / 28
        subsidy = Math.ceil(subsidy)
        subsidy -= subsidy / 28 * 4 / 28
        subsidy = Math.ceil(subsidy)
      }
    }

    if (subsidy / 1000000 < 1) {
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
 */
export const incentivePercents = () => {
  return [
    { block: 210000, percent: 1 },
    { block: 220000, percent: 2 },
    { block: 220222, percent: 3 },
    { block: 220888, percent: 4 },
    { block: 221998, percent: 5 },
    { block: 223552, percent: 6 },
    { block: 225550, percent: 7 },
    { block: 227992, percent: 8 },
    { block: 230878, percent: 9 },
    { block: 234208, percent: 10 },
    { block: 237982, percent: 11 },
    { block: 242200, percent: 12 },
    { block: 246862, percent: 13 },
    { block: 251968, percent: 14 },
    { block: 257518, percent: 15 },
    { block: 263512, percent: 16 },
    { block: 269950, percent: 17 },
    { block: 276832, percent: 18 },
    { block: 284158, percent: 19 },
    { block: 291928, percent: 20 },
    { block: 300142, percent: 21 },
    { block: 308800, percent: 22 },
    { block: 317902, percent: 23 },
    { block: 327448, percent: 24 },
    { block: 337438, percent: 25 },
    { block: 347872, percent: 26 },
    { block: 358750, percent: 27 },
    { block: 370072, percent: 28 },
    { block: 381838, percent: 29 },
    { block: 394048, percent: 30 },
    { block: 406702, percent: 31 },
    { block: 419800, percent: 32 },
    { block: 433342, percent: 33 },
    { block: 447328, percent: 34 },
    { block: 461758, percent: 35 },
    { block: 476632, percent: 36 },
    { block: 491950, percent: 37 },
    { block: 507712, percent: 38 },
    { block: 523918, percent: 39 },
    { block: 540568, percent: 40 }
  ]
}
