import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'

/** Ant Design */
import Select from 'antd/lib/select'

@translate(['common'])
@inject('gui', 'rates')
@observer
class SetCurrency extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.rates = props.rates
  }

  render() {
    return (
      <Select
        defaultValue={this.gui.localCurrency}
        notFoundContent={this.t('notFound')}
        onChange={currency => this.gui.setLocalCurrency(currency)}
        optionFilterProp="children"
        showSearch
        size="small"
        style={{ width: '110px' }}
      >
        {this.rates.localCurrencies.map(currency => (
          <Select.Option key={currency} value={currency}>
            {currency}
          </Select.Option>
        ))}
      </Select>
    )
  }
}

export default SetCurrency
