import React from 'react'
import { observer } from 'mobx-react'

/** Ant Design */
import Input from 'antd/lib/input'
import Popconfirm from 'antd/lib/popconfirm'

const RecipientListItem = observer(props => {
  const rec = props.send.recipients.get(props.send.recipientKeys[props.index])
  return (
    <div className="flex-sb" style={{ margin: '0 0 5px 0' }}>
      <div style={{ flex: 1.4 }}>
        <Input
          className={
            'mono ' +
            (rec.addressValid !== null
              ? rec.addressValid === true ? 'green' : 'red'
              : '')
          }
          id={rec.id}
          name="address"
          onChange={props.setRecipient}
          placeholder={props.t('address')}
          prefix={
            <Popconfirm
              cancelText={props.t('no')}
              okText={props.t('yes')}
              onConfirm={() => props.send.removeRecipient(rec.id)}
              placement="bottomLeft"
              title={props.t('recipientRemove')}
            >
              <div style={{ cursor: 'pointer' }}>
                <i className="material-icons md-14">delete_forever</i>
              </div>
            </Popconfirm>
          }
          size="small"
          value={rec.address}
        />
      </div>
      <div style={{ flex: 0.7, margin: '0 5px 0 5px' }}>
        <Input
          id={rec.id}
          name="amount"
          onChange={props.setRecipient}
          placeholder={props.t('amount')}
          size="small"
          suffix="XVC"
          value={rec.amount}
        />
      </div>
      <div style={{ flex: 0.7 }}>
        <Input
          disabled
          size="small"
          suffix={props.gui.localCurrency}
          value={new Intl.NumberFormat(props.gui.language, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(rec.amount * props.rates.average * props.rates.local)}
        />
      </div>
    </div>
  )
})

export default RecipientListItem
