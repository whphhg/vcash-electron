import { connect } from 'react-redux'
import Header from '../components/Header'

import { currencyConverter } from '../actions/currencyConverter'
import { menuToggleDrawer } from '../actions/menu'
import { sendToggleDrawer } from '../actions/send'

const mapStateToProps = (state) => ({
  balance: state.wallet.info.balance
})

const mapDispatchToProps = (dispatch) => ({
  currencyConverter: (amount, convertFrom) => {
    dispatch(
      currencyConverter({
        target: {
          value: 1,
          id: 'vcash'
        }
      })
    )
  },
  toggleMenu: () => {
    dispatch(menuToggleDrawer())
  },
  toggleSend: () => {
    dispatch(sendToggleDrawer())
  }
})

const HeaderContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Header)

export default HeaderContainer
