import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'

/** Ant Design */
import Input from 'antd/lib/input'

@translate(['wallet'])
@inject('gui', 'rates', 'send')
@observer
class SendTotal extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.rates = props.rates
    this.send = props.send
  }

  render() {
    /** Do not render if there are less than two recipients. */
    if (this.send.recipients.size < 2) return null
    return (
      <div className="flex-sb" style={{ flex: 1.4 }}>
        <div style={{ flex: 0.7, margin: '0 5px 0 0' }}>
          <Input
            disabled
            size="small"
            suffix="XVC"
            value={new Intl.NumberFormat(this.gui.language, {
              maximumFractionDigits: 6
            }).format(this.send.total)}
          />
        </div>
        <div style={{ flex: 0.7 }}>
          <Input
            disabled
            size="small"
            suffix={this.gui.localCurrency}
            value={new Intl.NumberFormat(this.gui.language, {
              maximumFractionDigits: 2,
              minimumFractionDigits: 2
            }).format(this.send.total * this.rates.local * this.rates.average)}
          />
        </div>
      </div>
    )
  }
}

export default SendTotal
