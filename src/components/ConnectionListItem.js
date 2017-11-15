import React from 'react'
import { observer } from 'mobx-react'

const ConnectionListItem = observer(({ t, connections, index }) => {
  const instance = connections.instances.get(connections.ids[index])
  const { rpc } = instance.status

  /**
   * Change viewing connection on list item click.
   * @function onClick
   */
  const onClick = () => connections.setViewing(instance.id)

  return (
    <div
      className={
        'list-item' +
        (index % 2 === 0 ? ' even' : '') +
        (instance.id === connections.viewingId ? ' selected' : '')
      }
      onClick={onClick}
    >
      <div className="flex-sb" style={{ padding: '5px' }}>
        <span style={{ fontWeight: '500' }}>
          {instance.type === 'local' ? '127.0.0.1' : instance.host}:
          {instance.type === 'local' ? instance.localPort : instance.port}
        </span>
        <span style={{ fontWeight: '400' }}>
          {instance.type === 'local' ? t('local') : 'SSH'}
        </span>
      </div>
      <div className="flex" style={{ padding: '5px' }}>
        <i
          className={
            'material-icons md-16 ' +
            (rpc === null ? '' : rpc === true ? 'green' : 'red')
          }
        >
          power_settings_new
        </i>
        <p>{rpc === true ? t('connected') : t('disconnected')}</p>
      </div>
    </div>
  )
})

export default ConnectionListItem
