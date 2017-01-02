import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Button, Col, Popover, Row, Switch } from 'antd'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('chainBlender', 'wallet') @observer

class ChainBlender extends React.Component {
  constructor (props) {
    super(props)
    this.chainBlender = props.chainBlender
    this.t = props.t
    this.wallet = props.wallet
    this.toggle = this.toggle.bind(this)
  }

  toggle () {
    this.chainBlender.toggle()
  }

  popoverTitle () {
    return (
      <Row style={{width: '265px'}}>
        <Col span={17}>
          <p>
            <span>{this.t('wallet:blended')} </span>
            <span className='text-dotted'>{this.chainBlender.info.blendedbalance.toFixed(6)}</span>
            <span> XVC ({this.chainBlender.info.blendedpercentage.toFixed(2)}%)</span>
          </p>
        </Col>
        <Col span={7} className='text-right'>
          <Switch
            checked={this.chainBlender.status === true}
            disabled={this.wallet.isLocked === true}
            onChange={this.toggle}
            checkedChildren={<i className='material-icons md-18' style={{margin: '1px 0 0 0'}}>done</i>}
            unCheckedChildren={<i className='material-icons md-18' style={{margin: '1px 0 0 0'}}>clear</i>}
          />
        </Col>
      </Row>
    )
  }

  popoverContent () {
    return (
      this.wallet.isLocked === false && (
        <Row>
          <Col span={12}>
            <p>{this.t('wallet:denominated')}</p>
            <p>{this.t('wallet:nonDenominated')}</p>
          </Col>
          <Col span={12} className='text-right'>
            <p><span className='text-dotted'>{this.chainBlender.info.denominatedbalance.toFixed(6)}</span> XVC</p>
            <p><span className='text-dotted'>{this.chainBlender.info.nondenominatedbalance.toFixed(6)}</span> XVC</p>
          </Col>
        </Row>
      ) || (
        <p>{this.t('wallet:unlockRequired')}</p>
      )
    )
  }

  render () {
    return (
      <Popover
        trigger='click'
        placement='bottomLeft'
        title={this.popoverTitle()}
        content={this.popoverContent()}
      >
        <Button>ChainBlender</Button>
      </Popover>
    )
  }
}

export default ChainBlender
