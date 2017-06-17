import React from 'react'
import { translate } from 'react-i18next'
import { action, observable } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Input, Select, Table } from 'antd'

/** Required components. */
import Address from './Address'
import AddressNew from './AddressNew'
import CurrencyConverter from './CurrencyConverter'
import KeyDump from './KeyDump'
import KeyImport from './KeyImport'
import SendControls from './SendControls'
import SendOptions from './SendOptions'
import SendRecipients from './SendRecipients'

@translate(['wallet'], { wait: true })
@inject('gui', 'rates', 'send', 'wallet')
@observer
class Addresses extends React.Component {
  @observable filters = { address: ['spendable', 'new'] }

  constructor (props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.rates = props.rates
    this.send = props.send
    this.wallet = props.wallet
  }

  /**
   * Handle table change.
   * @function tableChange
   */
  @action
  tableChange = (pagination, filters, sorter) => {
    this.filters = filters
  }

  render () {
    const { accountBalances, spendFrom } = this.wallet

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateRows: '35px 1fr',
          height: '100%'
        }}
      >
        <div className='shadow' style={{ minHeight: '35px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.1fr 1.4fr',
              height: '100%'
            }}
          >
            <div className='flex-sb'>
              <div className='flex' style={{ margin: '0 0 0 10px' }}>
                <AddressNew />
                <div style={{ margin: '0 5px 0 5px' }}><KeyImport /></div>
                <KeyDump />
              </div>
              <Input
                onChange={e =>
                  this.wallet.setSearch('addresses', e.target.value)}
                placeholder={this.t('wallet:searchAddresses')}
                prefix={<i className='material-icons md-14'>search</i>}
                size='small'
                style={{ margin: '0 10px 0 0', width: '290px' }}
                value={this.wallet.search.addresses.value}
              />
            </div>
            <div className='flex' style={{ margin: '0 10px 0 10px' }}>
              <SendControls />
            </div>
          </div>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 1.4fr',
            height: '100%'
          }}
        >
          <div style={{ margin: '10px' }}>
            <div className='flex-sb' style={{ margin: '0 0 10px 0' }}>
              <div style={{ lineHeight: '22px', margin: '0 36px 0 0' }}>
                <div className='flex'>
                  <i className='material-icons md-16'>account_balance</i>
                  <p>{this.t('wallet:spendFrom')}</p>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div className='flex'>
                  <Select
                    onChange={account => this.wallet.setSpendFrom(account)}
                    optionFilterProp='children'
                    size='small'
                    style={{ flex: 1, margin: '0 5px 0 0' }}
                    value={spendFrom}
                  >
                    <Select.Option
                      disabled={this.send.recipients.size > 1}
                      value='#'
                    >
                      {this.t('wallet:any')}
                    </Select.Option>
                    <Select.Option value='*'>
                      {this.t('wallet:default')}
                    </Select.Option>
                    {this.wallet.accounts.map(account =>
                      <Select.Option key={account} value={account}>
                        {account}
                      </Select.Option>
                    )}
                  </Select>
                  <div style={{ width: '140px' }}>
                    <Input
                      disabled
                      size='small'
                      suffix='XVC'
                      value={new Intl.NumberFormat(this.gui.language, {
                        maximumFractionDigits: 6
                      }).format(accountBalances[spendFrom])}
                    />
                  </div>
                </div>
              </div>
            </div>
            <Table
              bordered
              columns={[
                {
                  dataIndex: 'address',
                  filteredValue: this.filters.address.slice() || null,
                  filters: [
                    { text: this.t('wallet:spent'), value: 'spent' },
                    { text: this.t('wallet:spendable'), value: 'spendable' },
                    { text: this.t('wallet:new'), value: 'new' }
                  ],
                  onFilter: (value, { received, spent }) => {
                    switch (value) {
                      case 'spent':
                        return received - spent === 0 && received > 0
                      case 'spendable':
                        return received - spent !== 0
                      case 'new':
                        return received === 0
                    }
                  },
                  title: this.t('wallet:addresses'),
                  width: 290,
                  render: address => <p className='text-mono'>{address}</p>
                },
                {
                  dataIndex: 'balance',
                  sorter: (a, b) => a.balance - b.balance,
                  title: this.t('wallet:balance'),
                  render: balance =>
                    <p style={{ textAlign: 'right' }}>
                      {new Intl.NumberFormat(this.gui.language, {
                        minimumFractionDigits: 6,
                        maximumFractionDigits: 6
                      }).format(balance)}{' '}
                      XVC
                    </p>
                }
              ]}
              dataSource={this.wallet.addressesData}
              expandedRowRender={data => <Address data={data} />}
              locale={{
                emptyText: this.t('wallet:notFound'),
                filterConfirm: this.t('wallet:ok'),
                filterReset: this.t('wallet:reset')
              }}
              onChange={this.tableChange}
              pagination={false}
              rowKey='address'
              scroll={{ y: 504 }}
              size='small'
            />
          </div>
          <div style={{ margin: '10px' }}>
            <div
              style={{
                display: 'grid',
                gridGap: '10px',
                gridTemplateRows: '1fr 145px',
                height: '100%'
              }}
            >
              <SendRecipients />
              <div style={{ alignSelf: 'end' }}>
                <SendOptions />
                <hr />
                <CurrencyConverter />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Addresses
