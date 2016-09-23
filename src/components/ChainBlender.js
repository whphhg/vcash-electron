import React from 'react'
import { inject, observer } from 'mobx-react'
import { Switch, Icon, Row, Col, Popover, Button } from 'antd'

/** Make the component reactive and inject MobX stores. */
@observer(['chainBlender', 'wallet'])

/** ChainBlender component class. */
class ChainBlender extends React.Component {
  constructor(props) {
    super(props)
    this.chainBlender = props.chainBlender
    this.wallet = props.wallet

    /** Bind functions early. */
    this.toggle = this.toggle.bind(this)
  }

  toggle() {
    this.chainBlender.toggle()
  }

  render() {
    return (
      <Popover
        trigger='click'
        placement='bottomLeft'
        title={
          <Row>
            <Col span={17}><span>ChainBlender</span></Col>
            <Col span={7} style={{textAlign:'right'}}>
              <Switch
                checked={this.chainBlender.isActivated}
                disabled={this.wallet.isLocked}
                onChange={this.toggle}
                checkedChildren={<Icon type='check' />}
                unCheckedChildren={<Icon type='cross' />}
              />
            </Col>
          </Row>
        }
        content={
          !this.wallet.isLocked &&
          (
            <Row style={{width:'280px'}}>
              <Col span={12}>
                <p>Non-denominated</p>
                <p>Denominated</p>
                <p>Blended</p>
              </Col>

              <Col span={12}>
                <p><span>{this.chainBlender.nondenominatedbalance.toFixed(6)}</span> XVC</p>
                <p><span>{this.chainBlender.denominatedbalance.toFixed(6)}</span> XVC</p>
                <p><span>{this.chainBlender.blendedbalance.toFixed(6)}</span> XVC ({this.chainBlender.blendedpercentage.toFixed(2)}%)</p>
              </Col>
            </Row>
          ) ||
          (
            <p>Requires the wallet to be unlocked.</p>
          )
        }
      >
        <Button>ChainBlender</Button>
      </Popover>
    )
  }
}

export default ChainBlender
