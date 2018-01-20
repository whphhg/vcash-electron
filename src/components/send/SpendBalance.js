import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'

@translate(['common'])
@inject('gui', 'send')
@observer
class SpendBalance extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.send = props.send
  }

  render() {
    /** Do not render if the balance is zero. */
    if (this.send.spendBalance === 0) return null
    return (
      <div>
        <div className="flex-center" style={{ margin: '0 0 3px 0' }}>
          <p style={{ fontWeight: '500' }}>{this.t('spendBalance')}</p>
        </div>
        <p className="flex-center green">
          {new Intl.NumberFormat(this.gui.language, {
            maximumFractionDigits: 6
          }).format(this.send.spendBalance)}
        </p>
      </div>
    )
  }
}

export default SpendBalance
