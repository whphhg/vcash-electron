import { connect } from 'react-redux'
import WatchOnly from '../components/WatchOnly'

import { watchOnlyViewToggleDialog } from '../actions/watchOnlyView'
import { getExchangeRate, getLocalRate } from '../selectors/rates'

const mapStateToProps = (state) => ({
  ...state.watchOnly,
  localCurrency: state.settings.localCurrency,
  rate: getExchangeRate(state) * getLocalRate(state)
})

const WatchOnlyContainer = connect(
  mapStateToProps,
  {
    toggleEdit: watchOnlyViewToggleDialog
  }
)(WatchOnly)

export default WatchOnlyContainer
