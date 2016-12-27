import React from 'react'
import { inject, observer } from 'mobx-react'
import { Col, Row } from 'antd'

/** Required components. */
import AddressesTable from './AddressesTable'
import AddressNew from './AddressNew'
import KeyDump from './KeyDump'
import KeyImport from './KeyImport'

/** Make the component reactive and inject MobX stores. */
@inject('wallet') @observer

class Addresses extends React.Component {
  constructor (props) {
    super(props)
    this.wallet = props.wallet
  }

  render () {
    return (
      <div>
        <Row>
          <Col span={24} className='shadow'>
            <div className='toolbar'>
              <div className='left'>
                <AddressNew />
                <KeyImport />
                <KeyDump />
              </div>
              <div className='right'>
                <i className='material-icons md-20'>library_books</i>
                <p>Default wallet address&nbsp;
                  <span className='text-dotted'>
                    {
                      this.wallet.incentive.walletaddress === ''
                        ? 'will be revealed after first unlocking'
                        : this.wallet.incentive.walletaddress
                    }
                  </span>
                </p>
              </div>
            </div>
          </Col>
        </Row>
        <div id='addresses'>
          <AddressesTable />
        </div>
      </div>
    )
  }
}

export default Addresses
