import { connect } from 'react-redux'
import Footer from '../components/Footer'
import { getExchangeRate, getLocalRate } from '../selectors/rates'

const mapStateToProps = (state) => ({
  bittrexLast: state.rates.bittrex.last,
  exchangeRate: getExchangeRate(state),
  localCurrency: state.settings.localCurrency,
  localRate: getLocalRate(state),
  poloniexLast: state.rates.poloniex.last
})

const FooterContainer = connect(
  mapStateToProps
)(Footer)

export default FooterContainer
