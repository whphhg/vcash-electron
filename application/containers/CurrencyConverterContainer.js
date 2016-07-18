import { connect } from 'react-redux'
import CurrencyConverter from '../components/CurrencyConverter'
import { currencyConverter } from '../actions/currencyConverter'

const mapStateToProps = (state) => ({
  ...state.ui.currencyConverter,
  localCurrency: state.settings.localCurrency,
})

const CurrencyConverterContainer = connect(
  mapStateToProps,
  { currencyConverter }
)(CurrencyConverter)

export default CurrencyConverterContainer
