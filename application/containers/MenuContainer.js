import { connect } from 'react-redux'
import Menu from '../components/Menu'

import { menuToggleDrawer } from '../actions/menu'
import { walletEncryptToggleDialog } from '../actions/walletEncrypt'
import { walletLock } from '../actions/walletLock'
import { walletUnlockToggleDialog } from '../actions/walletUnlock'

import { getExchangeRate, getLocalRate } from '../selectors/rates'

const mapStateToProps = (state) => ({
  isOpen: state.ui.menu.isOpen,
  exchangeRate: getExchangeRate(state),
  localCurrency: state.settings.localCurrency,
  localRate: getLocalRate(state),
  unconfirmed: state.transactions.unconfirmedTotal,
  wallet: state.wallet
})

const MenuContainer = connect(
  mapStateToProps,
  {
    toggleEncrypt: walletEncryptToggleDialog,
    toggleMenu: menuToggleDrawer,
    toggleUnlock: walletUnlockToggleDialog,
    walletLock
  }
)(Menu)

export default MenuContainer
