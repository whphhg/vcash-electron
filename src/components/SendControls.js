import React from 'react'
import { translate } from 'react-i18next'
import { action, observable } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Button, Popconfirm, Switch } from 'antd'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('info', 'rates', 'send', 'ui') @observer

export default class Send extends React.Component {
  @observable popconfirm = false

  constructor (props) {
    super(props)
    this.t = props.t
    this.info = props.info
    this.rates = props.rates
    this.send = props.send
    this.ui = props.ui
  }

  /**
   * Toggle visibility of popconfirm.
   * @function togglePopconfirm
   */
  @action togglePopconfirm = () => {
    if (
      this.info.isLocked === false &&
      this.send.errorStatus === false
    ) {
      this.popconfirm = !this.popconfirm
    }
  }

  /**
   * Confirm sending.
   * @function confirm
   */
  confirm = () => {
    this.send.confirm()
  }

  /**
   * Add empty recipient.
   * @function addRecipient
   */
  addRecipient = () => {
    this.send.addRecipient()
  }

  /**
   * Clear recipients and options.
   * @function clear
   */
  clear = () => {
    this.send.clear()
  }

  render () {
    return (
      <div>
        <div style={{float: 'left'}}>
          <Popconfirm
            placement='bottomLeft'
            title={this.t('wallet:sendConfirm')}
            okText={this.t('wallet:yes')}
            cancelText={this.t('wallet:no')}
            onConfirm={this.confirm}
            visible={this.popconfirm}
            onVisibleChange={this.togglePopconfirm}
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
            onClick={this.addRecipient}
            disabled={this.send.fromAccount === null}
            size='small'
          >
            {this.t('wallet:recipientAdd')}
          </Button>
          <Popconfirm
            placement='bottom'
            title={this.t('wallet:sendReset')}
            okText={this.t('wallet:yes')}
            cancelText={this.t('wallet:no')}
            onConfirm={this.clear}
          >
            <Button size='small'>{this.t('wallet:reset')}</Button>
          </Popconfirm>
        </div>
        <div style={{float: 'right'}}>
          <i className='material-icons md-20'>timer_off</i>
          <p>{this.t('wallet:zeroTime')}</p>
          <Switch
            size='small'
            style={{verticalAlign: '1px', margin: '0 20px 0 0'}}
            checkedChildren={
              <i
                className='material-icons md-16'
                style={{margin: '-2px 0 0 0'}}
              >
                done
              </i>
            }
            unCheckedChildren={
              <i
                className='material-icons md-16'
                style={{margin: '-2px 0 0 0'}}
              >
                clear
              </i>
            }
          />
          <i className='material-icons md-20'>shuffle</i>
          <p>{this.t('wallet:blendedOnly')}</p>
          <Switch
            size='small'
            style={{verticalAlign: '1px'}}
            checkedChildren={
              <i
                className='material-icons md-16'
                style={{margin: '-2px 0 0 0'}}
              >
                done
              </i>
            }
            unCheckedChildren={
              <i
                className='material-icons md-16'
                style={{margin: '-2px 0 0 0'}}
              >
                clear
              </i>
            }
          />
        </div>
      </div>
    )
  }
}
