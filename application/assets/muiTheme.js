import  * as Colors from 'material-ui/styles/colors'
import { fade } from 'material-ui/utils/colorManipulator'
import Spacing from 'material-ui/styles/spacing'

export default {
  spacing: Spacing,
  fontFamily: 'Roboto, sans-serif',
  palette: {
    primary1Color: '#b60127',
    primary2Color: '#b60127',
    primary3Color: Colors.grey400,
    accent1Color: Colors.red800,
    accent2Color: Colors.grey100,
    accent3Color: Colors.grey500,
    textColor: Colors.darkBlack,
    alternateTextColor: Colors.white,
    canvasColor: Colors.white,
    borderColor: Colors.grey300,
    disabledColor: fade(Colors.darkBlack, 0.3),
    pickerHeaderColor: Colors.cyan500,
    clockCircleColor: fade(Colors.darkBlack, 0.07),
    shadowColor: Colors.fullBlack,
  },
  tableHeaderColumn: {
    height: 24,
    spacing: 7
  },
  tableRow: {
    hoverColor: Colors.grey200,
    selectedColor: Colors.grey300,
    stripeColor: Colors.grey50,
    height: 24
  },
  tableRowColumn: {
    height: 24,
    spacing: 7
  }
}
