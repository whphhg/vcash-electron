import React from 'react'
import { translate } from 'react-i18next'
import { action, observable } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Button, Popconfirm, Switch, Tooltip } from 'antd'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('info', 'rates', 'send') @observer

export default class Send extends React.Component {
  @observable popconfirm = false

  constructor (props) {
    super(props)
    this.t = props.t
    this.info = props.info
    this.rates = props.rates
    this.send = props.send
  }

  /**
   * Toggle visibility of popconfirm.
   * @function togglePopconfirm
   */
  @action togglePopconfirm = () => {
    if (this.info.isLocked === false && this.send.errorStatus === false) {
      this.popconfirm = !this.popconfirm
    }
  }

  render () {
    return (
      <div className='flex-sb'>
        <div className='flex'>
          <Popconfirm
            cancelText={this.t('wallet:no')}
            okText={this.t('wallet:yes')}
            onConfirm={() => this.send.confirm()}
            onVisibleChange={this.togglePopconfirm}
            placement='bottom'
            title={this.t('wallet:sendConfirm')}
            visible={this.popconfirm}
          >
            <Button
              disabled={
                this.info.isLocked === true ||
                this.info.wallet.balance < 0.0005 ||
                this.send.errorStatus !== false
              }
              size='small'
            >
              {this.t('wallet:send')}
            </Button>
          </Popconfirm>
          <Button
            disabled={this.send.fromAccount === null}
            onClick={() => this.send.addRecipient()}
            size='small'
            style={{margin: '0 5px 0 5px'}}
          >
            <div style={{margin: '2px 0 0 0'}}>
              <i className='material-icons md-16'>person_add</i>
            </div>
          </Button>
          <Popconfirm
            cancelText={this.t('wallet:no')}
            okText={this.t('wallet:yes')}
            onConfirm={() => this.send.clear()}
            placement='bottom'
            title={this.t('wallet:sendReset')}
          >
            <Button size='small'>{this.t('wallet:reset')}</Button>
          </Popconfirm>
        </div>
        <div className='flex'>
          <i className='material-icons md-16'>timer_off</i>
          <Tooltip placement='bottomLeft' title={this.t('wallet:zeroTime')}>
            <Switch
              checkedChildren={
                <div style={{margin: '-2px 0 0 0'}}>
                  <i className='material-icons md-16'>done</i>
                </div>
              }
              disabled
              size='small'
              style={{margin: '0 20px 0 5px'}}
              unCheckedChildren={
                <div style={{margin: '-2px 0 0 0'}}>
                  <i className='material-icons md-16'>clear</i>
                </div>
              }
            />
          </Tooltip>
          <i className='material-icons md-16'>shuffle</i>
          <Tooltip placement='bottomLeft' title={this.t('wallet:blendedOnly')}>
            <Switch
              checkedChildren={
                <div style={{margin: '-2px 0 0 0'}}>
                  <i className='material-icons md-16'>done</i>
                </div>
              }
              disabled
              size='small'
              style={{margin: '0 0 0 5px'}}
              unCheckedChildren={
                <div style={{margin: '-2px 0 0 0'}}>
                  <i className='material-icons md-16'>clear</i>
                </div>
              }
            />
          </Tooltip>
        </div>
      </div>
    )
  }
}
