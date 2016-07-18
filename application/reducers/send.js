import * as types from '../constants/ActionTypes'
import uuid from 'node-uuid'

const initialState = {
  account: 'Default',
  errors: {
    insufficientBalance: false,
    insufficientFunds: false,
    nonStandardTxType: false
  },
  isOpen: false,
  recipients: [
    {
      id: uuid.v4(),
      address: '',
      amount: '',
      isInvalid: null
    }
  ],
  total: 0,
  btnSend: false,
  btnSendDisabled: true
}

const send = (state = initialState, action) => {
  switch(action.type) {
    case types.SEND_RECIPIENT_NEW:
      return {
        ...state,
        recipients: [
          ...state.recipients,
          {
            id: uuid.v4(),
            address: '',
            amount: '',
            isInvalid: null
          }
        ]
      }

    case types.SEND_RECIPIENT_REMOVE:
      return {
        ...state,
        recipients: state.recipients.filter((recipient) => {
          if (recipient.id !== action.id) {
            return true
          }
        })
      }

    case types.SEND_RECIPIENT_SET:
      return {
        ...state,
        recipients: state.recipients.map((recipient) => {
          if (recipient.id === action.id) {
            recipient = {
              ...recipient,
              ...action.data
            }
          }

          return recipient
        })
      }

    case types.SEND_SET_ACCOUNT:
      return {
        ...state,
        account: action.account
      }

    case types.SEND_SET_ERROR:
      return {
        ...state,
        errors: {
          ...action.errors
        }
      }

    case types.SEND_TOGGLE_BUTTON:
      return {
        ...state,
        btnSend: !state.btnSend
      }

    case types.SEND_TOGGLE_DRAWER:
      return {
        ...state,
        isOpen: !state.isOpen
      }

    case types.SEND_VERIFY:
      return {
        ...state,
        btnSendDisabled: action.btnSendDisabled,
        total: action.total
      }

    default:
      return state
  }
}

export default send
