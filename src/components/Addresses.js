import React from 'react'
import { translate } from 'react-i18next'
import { action, observable } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Table } from 'antd'

/** Required components. */
import Address from './Address'
import AddressNew from './AddressNew'
import CurrencyConverter from './CurrencyConverter'
import KeyDump from './KeyDump'
import KeyImport from './KeyImport'
import SendControls from './SendControls'
import SendOptions from './SendOptions'
import SendRecipients from './SendRecipients'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('gui', 'rates', 'send', 'wallet') @observer

export default class Addresses extends React.Component {
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
  @action tableChange = (pagination, filters, sorter) => {
    this.filters = filters
  }

  render () {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateRows: '35px 1fr',
          height: '100%'
        }}
      >
        <div className='shadow' style={{minHeight: '35px'}}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.1fr 1.4fr',
              height: '100%'
            }}
          >
            <div className='flex' style={{margin: '0 10px 0 10px'}}>
              <AddressNew />
              <div style={{margin: '0 5px 0 5px'}}><KeyImport /></div>
              <KeyDump />
            </div>
            <div className='flex' style={{margin: '0 10px 0 10px'}}>
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
          <div style={{margin: '10px'}}>
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
                      case 'spent': return received - spent === 0 && received > 0
                      case 'spendable': return received - spent !== 0
                      case 'new': return received === 0
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
                  render: balance => (
                    <p style={{textAlign: 'right'}}>
                      {
                        new Intl.NumberFormat(this.gui.language, {
                          minimumFractionDigits: 6,
                          maximumFractionDigits: 6
                        }).format(balance)
                      } XVC
                    </p>
                  )
                }
              ]}
              dataSource={this.wallet.addressData}
              expandedRowRender={data => <Address data={data} />}
              locale={{
                emptyText: this.t('wallet:notFound'),
                filterConfirm: this.t('wallet:ok'),
                filterReset: this.t('wallet:reset')
              }}
              onChange={this.tableChange}
              pagination={false}
              rowKey='address'
              scroll={{y: 536}}
              size='small'
            />
          </div>
          <div style={{margin: '10px'}}>
            <div
              style={{
                display: 'grid',
                gridGap: '10px',
                gridTemplateRows: '1fr 175px',
                height: '100%'
              }}
            >
              <SendRecipients />
              <div style={{alignSelf: 'end'}}>
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
