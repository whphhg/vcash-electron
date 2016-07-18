import { connect } from 'react-redux'
import SetLocalCurrency from '../components/SetLocalCurrency'

import { setLocalCurrency } from '../actions/settings'
import { getLocalCurrencies } from '../selectors/rates'

const mapStateToProps = (state) => ({
  localCurrencies: getLocalCurrencies(state),
  localCurrency: state.settings.localCurrency
})

const SetLocalCurrencyContainer = connect(
  mapStateToProps,
  { setLocalCurrency }
)(SetLocalCurrency)

export default SetLocalCurrencyContainer
