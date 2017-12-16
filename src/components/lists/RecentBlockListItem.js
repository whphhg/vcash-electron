import React from 'react'
import { observer } from 'mobx-react'
import { humanReadable } from '../../utilities/common'
import moment from 'moment'

const RecentBlockListItem = observer(props => {
  const block = props.statistics.recentBlocks[props.index]
  return (
    <div className={'list-item-plain' + (props.index % 2 === 0 ? ' even' : '')}>
      <div className="flex">
        <p style={{ minWidth: '65px' }}>{block.height}</p>
        <p style={{ minWidth: '50px' }}>{block.type}</p>
        <p style={{ minWidth: '130px' }}>{moment(block.time).fromNow(true)}</p>
        <p style={{ minWidth: '80px' }}>
          {humanReadable(block.size, true, 'B', props.gui.language)}
        </p>
        <p style={{ minWidth: '80px' }}>
          {new Intl.NumberFormat(props.gui.language).format(block.txCount)}
        </p>
      </div>
    </div>
  )
})

export default RecentBlockListItem
