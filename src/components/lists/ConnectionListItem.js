import React from 'react'
import { observer } from 'mobx-react'

const ConnectionListItem = observer(({ t, connections, index }) => {
  const instance = connections.instances.get(connections.ids[index])
  const { rpc } = instance.status
  const color = rpc === null ? '' : rpc === true ? 'green' : 'red'

  return (
    <div
      className={
        'list-item' +
        (index % 2 === 0 ? ' even' : '') +
        (connections.viewingId === instance.id ? ' selected' : '')
      }
      onClick={() => connections.setViewing(instance.id)}
    >
      <div className="flex-sb">
        <p style={{ fontWeight: '500' }}>
          {instance.type === 'local' ? '127.0.0.1' : instance.host}:
          {instance.type === 'local' ? instance.localPort : instance.port}
        </p>
        <p style={{ fontWeight: '400' }}>
          {instance.type === 'local' ? t('local') : 'SSH'}
        </p>
      </div>
      <div className="flex">
        <i className={'material-icons md-16 ' + color}>power_settings_new</i>
        <p>{rpc === true ? t('connected') : t('disconnected')}</p>
      </div>
    </div>
  )
})

export default ConnectionListItem
