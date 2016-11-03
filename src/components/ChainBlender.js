import React from 'react'
import { inject, observer } from 'mobx-react'
import { Button, Col, Icon, Popover, Row, Switch } from 'antd'

/** Make the component reactive and inject MobX stores. */
@observer(['chainBlender', 'wallet'])

class ChainBlender extends React.Component {
  constructor(props) {
    super(props)
    this.chainBlender = props.chainBlender
    this.wallet = props.wallet
    this.toggle = this.toggle.bind(this)
  }

  toggle() {
    this.chainBlender.toggle()
  }

  popoverTitle() {
    return (
      <Row>
        <Col span={17}>
          <span>ChainBlender</span>
        </Col>
        <Col span={7} style={{textAlign:'right'}}>
          <Switch
            checked={this.chainBlender.status === true}
            disabled={this.wallet.isLocked === true}
            onChange={this.toggle}
            checkedChildren={<Icon type='check' />}
            unCheckedChildren={<Icon type='cross' />}
          />
        </Col>
      </Row>
    )
  }

  popoverContent() {
    return (
      this.wallet.isLocked === false && (
        <Row style={{width:'290px'}}>
          <Col span={9}>
            <p>Non-denominated</p>
            <p>Denominated</p>
            <p>Blended</p>
          </Col>
          <Col span={10} className='text-right'>
            <p><span>{this.chainBlender.info.nondenominatedbalance.toFixed(6)}</span> XVC</p>
            <p><span>{this.chainBlender.info.denominatedbalance.toFixed(6)}</span> XVC</p>
            <p><span>{this.chainBlender.info.blendedbalance.toFixed(6)}</span> XVC</p>
          </Col>
          <Col span={5} className='text-right'>
            <p>{this.chainBlender.nonDenominatedPercentage.toFixed(2)}%</p>
            <p>{this.chainBlender.denominatedPercentage.toFixed(2)}%</p>
            <p>{this.chainBlender.info.blendedpercentage.toFixed(2)}%</p>
          </Col>
        </Row>
      ) || (
        <p>Requires the wallet to be unlocked.</p>
      )
    )
  }

  render() {
    return (
      <Popover trigger='click' placement='bottomLeft' title={this.popoverTitle()} content={this.popoverContent()}>
        <Button>ChainBlender</Button>
      </Popover>
    )
  }
}

export default ChainBlender
