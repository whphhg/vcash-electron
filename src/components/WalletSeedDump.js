import React from 'react'
import { translate } from 'react-i18next'
import { action, computed, observable } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Button, Col, Input, Row } from 'antd'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('wallet') @observer

class WalletSeedDump extends React.Component {
  @observable seed = ''
  @observable error = false

  constructor (props) {
    super(props)
    this.t = props.t
    this.wallet = props.wallet
    this.dumpSeed = this.dumpSeed.bind(this)
    this.setSeed = this.setSeed.bind(this)
  }

  componentWillUnmount () {
    if (this.seed !== '') {
      this.setSeed()
    }
  }

  @computed get errorStatus () {
    if (this.error !== false) return this.error
    return false
  }

  @action setError (error = false) {
    this.error = error
  }

  @action setSeed (seed = '') {
    this.seed = seed
  }

  dumpSeed () {
    this.wallet.dumpSeed((result, error) => {
      if (result !== undefined) {
        this.setSeed(result)
      }

      if (error !== this.error) {
        this.setError(error)
      }
    })
  }

  render () {
    return (
      <div>
        <p style={{margin: '0 0 5px 0'}}>
          <i className='material-icons md-18'>fingerprint</i>
          <span className='text-icon'>
            {this.t('wallet:seedDumpLong')}
          </span>
        </p>
        <Row>
          <Col span={3}>
            <p style={{margin: '4px 0 0 0'}}>
              {this.t('wallet:seed')}
            </p>
          </Col>
          <Col span={21}>
            <Input
              value={this.seed}
              disabled={this.seed === ''}
              readOnly
            />
          </Col>
        </Row>
        <Row>
          <Col offset={3} span={8}>
            <p className='text-error'>
              {
                this.errorStatus === 'notDeterministic' &&
                this.t('wallet:notDeterministic')
              }
            </p>
          </Col>
          <Col span={13} className='text-right'>
            <Button
              style={{margin: '5px 0 0 0'}}
              onClick={this.dumpSeed}
              disabled={
                this.errorStatus !== false ||
                this.wallet.isLocked === true
              }
            >
              {this.t('wallet:seedDump')}
            </Button>
          </Col>
        </Row>
      </div>
    )
  }
}

export default WalletSeedDump
