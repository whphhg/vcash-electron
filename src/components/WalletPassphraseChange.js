import React from 'react'
import { translate } from 'react-i18next'
import { action, computed, observable, reaction } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Button, Col, Input, Row } from 'antd'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('wallet') @observer

export default class WalletPassphraseChange extends React.Component {
  @observable current = ''
  @observable next = ''
  @observable repeat = ''
  @observable error = false

  constructor (props) {
    super(props)
    this.t = props.t
    this.wallet = props.wallet
    this.passphraseChange = this.passphraseChange.bind(this)
    this.setPassphrase = this.setPassphrase.bind(this)

    /** Clear previous error on current passphrase change. */
    reaction(() => this.current, (current) => {
      if (this.error !== false) {
        this.setError()
      }
    })
  }

  @computed get errorStatus () {
    /** Get lengths only once. */
    const len = {
      old: this.current.length,
      next: this.next.length,
      repeat: this.repeat.length
    }

    if (len.old < 1 || len.next < 1 || len.repeat < 1) return 'emptyFields'
    if (this.next === this.current) return 'oldEqualsNew'
    if (len.next !== len.repeat) return 'differentLengths'
    if (this.next !== this.repeat) return 'notMatching'
    if (this.error !== false) return this.error
    return false
  }

  @action setError (error = false) {
    this.error = error
  }

  @action setPassphrase (e) {
    this[e.target.name] = e.target.value
  }

  passphraseChange () {
    this.wallet.passphraseChange(this.current, this.next, (result, error) => {
      if (error !== this.error) {
        this.setError(error)
      }
    })
  }

  render () {
    if (this.wallet.isEncrypted === false) return null
    return (
      <div>
        <p style={{margin: '0 0 5px 0'}}>
          <i className='material-icons md-18'>vpn_key</i>
          <span className='text-icon'>
            {this.t('wallet:passphraseChangeLong')}
          </span>
        </p>
        <Row>
          <Col span={4}>
            <p style={{margin: '4px 0 0 0'}}>
              {this.t('wallet:passphrase')}
            </p>
            <p style={{margin: '14px 0 0 0'}}>
              {this.t('wallet:passphraseNew')}
            </p>
            <p style={{margin: '14px 0 0 0'}}>
              {this.t('wallet:passphraseRepeat')}
            </p>
          </Col>
          <Col span={20}>
            <Input
              name='current'
              placeholder={this.t('wallet:passphraseLong')}
              value={this.current}
              onChange={this.setPassphrase}
            />
            <Input
              name='next'
              placeholder={this.t('wallet:passphraseNewLong')}
              style={{margin: '5px 0 0 0'}}
              value={this.next}
              onChange={this.setPassphrase}
            />
            <Input
              name='repeat'
              placeholder={this.t('wallet:passphraseRepeatLong')}
              style={{margin: '5px 0 0 0'}}
              value={this.repeat}
              onChange={this.setPassphrase}
            />
          </Col>
        </Row>
        <Row>
          <Col offset={4} span={13}>
            <p className='text-error'>
              {
                (
                  this.errorStatus === 'notMatching' &&
                  this.t('wallet:passphrasesNotMatching')
                ) || (
                  this.errorStatus === 'incorrectPassphrase' &&
                  this.t('wallet:passphraseIncorrect')
                ) || (
                  this.errorStatus === 'oldEqualsNew' &&
                  this.t('wallet:passphrasesEqual')
                )
              }
            </p>
          </Col>
          <Col span={7} className='text-right'>
            <Button
              style={{margin: '5px 0 0 0'}}
              onClick={this.passphraseChange}
              disabled={this.errorStatus !== false}
            >
              {this.t('wallet:passphraseChange')}
            </Button>
          </Col>
        </Row>
      </div>
    )
  }
}
