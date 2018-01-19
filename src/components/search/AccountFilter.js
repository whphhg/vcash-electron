import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'

/** Ant Design */
import Select from 'antd/lib/select'

@translate(['common'])
@inject('send', 'wallet')
@observer
class AccountFilter extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.send = props.send
    this.wallet = props.wallet
  }

  render() {
    return (
      <Select
        onChange={acc => this.send.setSpendFrom(acc)}
        optionFilterProp="children"
        size="small"
        style={{ width: '140px' }}
        value={this.send.spend.fromAccount}
      >
        <Select.Option
          disabled={
            this.send.recipients.size > 1 && this.send.spend.utxo.length === 0
          }
          value="*ANY*"
        >
          {this.t('any')}
        </Select.Option>
        <Select.Option value="*DEFAULT*">{this.t('default')}</Select.Option>
        {this.wallet.accNames.map(acc => (
          <Select.Option key={acc} value={acc}>
            {acc}
          </Select.Option>
        ))}
      </Select>
    )
  }
}

export default AccountFilter
