import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'

/** Ant Design */
import Input from 'antd/lib/input'

@translate(['wallet'])
@inject('search')
@observer
class TransactionFind extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.search = props.search
  }

  render() {
    return (
      <Input
        onChange={e => this.search.setKeywords('tx', e.target.value)}
        placeholder={this.t('searchTransactions')}
        prefix={<i className="material-icons md-14">search</i>}
        size="small"
        value={this.search.find.tx.value}
      />
    )
  }
}

export default TransactionFind
