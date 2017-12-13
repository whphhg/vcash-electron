import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import moment from 'moment'

/** Ant Design */
import Table from 'antd/lib/table'

@translate(['wallet'])
@inject('gui', 'wallet')
@observer
class Peers extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.wallet = props.wallet
  }

  render() {
    return (
      <Table
        bordered
        columns={[
          {
            dataIndex: 'ip',
            width: 180,
            title: (
              <div className="flex-sb">
                <p>{this.t('peers')}</p>
                <p>{this.t('port')}</p>
              </div>
            ),
            render: (ip, record) => (
              <div
                className="flex-sb"
                style={{ fontWeight: record.inbound === true ? '500' : '' }}
              >
                <p>{ip}</p>
                <p>{record.port}</p>
              </div>
            )
          },
          {
            dataIndex: 'version',
            width: 120,
            title: (
              <div className="flex-sb">
                <p>{this.t('version')}</p>
                <p>{this.t('os')}</p>
              </div>
            ),
            render: (version, record) => (
              <div className="flex-sb">
                <p>{version}</p>
                <p>{record.os}</p>
              </div>
            )
          },
          {
            dataIndex: 'conntime',
            width: 300,
            title: (
              <div className="flex-sb">
                <p>{this.t('connected')}</p>
                <p>{this.t('received')}</p>
              </div>
            ),
            render: (conntime, record) => (
              <div className="flex-sb">
                <p>{moment(conntime).fromNow(true)}</p>
                <p>{moment(record.lastrecv).fromNow()}</p>
              </div>
            )
          },
          {
            dataIndex: 'startingheight',
            title: (
              <div className="flex-sb">
                <p>{this.t('startingHeight')}</p>
                <p>{this.t('banScore')}</p>
              </div>
            ),
            render: (height, record) => (
              <div className="flex-sb">
                <p>{new Intl.NumberFormat(this.gui.language).format(height)}</p>
                <p>{record.banscore}/100</p>
              </div>
            )
          }
        ]}
        dataSource={this.wallet.peers}
        locale={{ emptyText: this.t('notFound') }}
        pagination={false}
        scroll={this.wallet.peers.length > 8 ? { y: 158 } : {}}
        size="small"
      />
    )
  }
}

export default Peers
