import * as types from '../constants/ActionTypes'
import rpc from '../utilities/rpc'
import { decimalSeparator } from '../utilities/common'
import { transactionToggleDialog } from './transaction'

export const send = () => {
  return (dispatch, getState) => {
    let account = getState().ui.send.account
    let recipients = {}

    getState().ui.send.recipients.map((recipient) => {
      recipients[recipient.address] = recipient.amount
    })

    if (account === '#All') {
      const options = {
        method: 'sendtoaddress',
        params: [
          getState().ui.send.recipients[0].address,
          getState().ui.send.recipients[0].amount
        ]
      }

      rpc(options, dispatch, getState, (response) => {
        if (response !== null) {
          if (response.hasOwnProperty('result')) {
            dispatch(transactionToggleDialog(response.result))
            dispatch(sendToggleButton())

            dispatch({
              type: types.SEND_SET_ERROR,
              errors: {
                insufficientBalance: false,
                insufficientFunds: false,
                nonStandardTxType: false
              }
            })
          }

          if (response.hasOwnProperty('error')) {
            let insufficientFunds = false

            // error_code_wallet_insufficient_funds (-4), insufficient funds.
            switch (response.error.code) {
              case -4:
                insufficientFunds = true
              break
            }

            dispatch({
              type: types.SEND_SET_ERROR,
              errors: {
                insufficientFunds
              }
            })

            dispatch(sendToggleButton())
          }
        }
      })
    } else {
      const options = {
        method: 'sendmany',
        params: [
          account === 'Default' ? '' : account,
          recipients
        ]
      }

      rpc(options, dispatch, getState, (response) => {
        if (response !== null) {
          console.log(response)

          if (response.hasOwnProperty('result')) {
            dispatch(transactionToggleDialog(response.result))
            dispatch(sendToggleButton())

            dispatch({
              type: types.SEND_SET_ERROR,
              errors: {
                insufficientBalance: false,
                insufficientFunds: false,
                nonStandardTxType: false
              }
            })
          }

          if (response.hasOwnProperty('error')) {
            let insufficientFunds = false
            let nonStandardTxType = false

            /**
             * error_code (-4), nonstandard transaction type.
             * error_code_wallet_insufficient_funds (-6), insufficient funds.
             */
            switch (response.error.code) {
              case -4:
                nonStandardTxType = true
              break

              case -6:
                insufficientFunds = true
              break
            }

            dispatch({
              type: types.SEND_SET_ERROR,
              errors: {
                insufficientFunds,
                nonStandardTxType
              }
            })

            dispatch(sendToggleButton())
          }
        }
      })
    }
  }
}

export const sendRecipientNew = () => {
  return (dispatch, getState) => {
    dispatch({
      type: types.SEND_RECIPIENT_NEW
    })

    dispatch(sendVerify())
  }
}

export const sendRecipientRemove = (id) => {
  return (dispatch, getState) => {
    const recipients = getState().ui.send.recipients.length

    dispatch({
      type: types.SEND_RECIPIENT_REMOVE,
      id
    })

    if (recipients === 1) {
      dispatch(sendRecipientNew())
    } else {
      dispatch(sendVerify())
    }
  }
}

export const sendRecipientSetAddress = (event) => {
  return (dispatch, getState) => {
    const id = event.target.id.split('_')[1]
    const address = event.target.value
    let update = true

    // Check if address is between 0-34 alpha-numeric characters.
    if (!address.match(/^[a-zA-Z0-9]{0,34}$/)) {
      update = false
    }

    // Check if the address is already entered.
    if (address.length === 34) {
      for (let i = 0; i < getState().ui.send.recipients.length; i++) {
        if (getState().ui.send.recipients[i].id !== id) {
          if (getState().ui.send.recipients[i].address === address) {
            update = false
            break
          }
        }
      }
    }

    if (update) {
      // Validate address when it reaches 34 characters.
      if (address.length === 34) {
        const options = {
          method: 'validateaddress',
          params: [address]
        }

        rpc(options, dispatch, getState, (response) => {
          if (response !== null) {
            dispatch({
              type: types.SEND_RECIPIENT_SET,
              id,
              data: {
                address,
                isInvalid: !response.result.isvalid
              }
            })

            dispatch(sendVerify())
          }
        })
      } else {
        dispatch({
          type: types.SEND_RECIPIENT_SET,
          id,
          data: {
            address,
            isInvalid: null
          }
        })

        dispatch(sendVerify())
      }
    }
  }
}

export const sendRecipientSetAmount = (event) => {
  return (dispatch, getState) => {
    const id = event.target.id.split('_')[1]
    let amount = event.target.value
    let total = getState().ui.send.total * 1000000
    let previousAmount = 0
    let update = true

    switch (amount) {
      case '.':
        amount = '0.'
      break

      case ',':
        amount = '0,'
      break
    }

    // Get previous amount.
    for (let i = 0; i < getState().ui.send.recipients.length; i++) {
      if (getState().ui.send.recipients[i].id === id) {
        previousAmount = getState().ui.send.recipients[i].amount * 1000000
        break
      }
    }

    // Adjust total
    if (amount.length > 0) {
      total = total - previousAmount + (parseFloat(amount) * 1000000)
    } else {
      total = total - previousAmount
    }

    total = total / 1000000

    // Check if amount is in 0000000[.,]000000 format.
    switch (decimalSeparator()) {
      case '.':
        if (!amount.match(/^\d{0,7}(?:\.\d{0,6})?$/)) {
          update = false
        }
      break

      case ',':
        if (!amount.match(/^\d{0,7}(?:,\d{0,6})?$/)) {
          update = false
        }
      break
    }

    // Check if account balance can cover total.
    if ((getState().addressBook.byAccount[getState().ui.send.account].balance - total) < 0) {
      update = false
    }

    // Check if amount is below tx fee.
    if (parseFloat(amount) > 0 && parseFloat(amount) < 0.0005) {
      update = false
    }

    // Update when removing last number from the input field.
    if (amount.length === 0) {
      update = true
    }

    if (update) {
      dispatch({
        type: types.SEND_RECIPIENT_SET,
        id,
        data: {
          amount
        }
      })

      dispatch(sendVerify())
    }
  }
}

export const sendSetAccount = (event, index, value) => {
  return (dispatch, getState) => {
    dispatch({
      type: types.SEND_SET_ACCOUNT,
      account: value
    })

    dispatch(sendVerify())
  }
}

export const sendToggleButton = () => ({
  type: types.SEND_TOGGLE_BUTTON
})

export const sendToggleDrawer = () => ({
  type: types.SEND_TOGGLE_DRAWER
})

export const sendVerify = () => {
  return (dispatch, getState) => {
    let btnSendDisabled = false
    let total = 0

    getState().ui.send.recipients.map((recipient) => {
      // Check if addresses are valid and entered.
      if (recipient.isInvalid === true || recipient.isInvalid === null) {
        btnSendDisabled = true
      }

      // Check if amounts are entered.
      if (parseFloat(recipient.amount) < 0.0005 || recipient.amount.length === 0) {
        btnSendDisabled = true
      } else {
        total += recipient.amount * 1000000
      }
    })

    total = total / 1000000

    // Check if account balance can cover total.
    if ((getState().addressBook.byAccount[getState().ui.send.account].balance - total) < 0) {
      btnSendDisabled = true

      dispatch({
        type: types.SEND_SET_ERROR,
        errors: {
          insufficientBalance: true
        }
      })
    } else {
      if (getState().ui.send.errors.insufficientBalance) {
        dispatch({
          type: types.SEND_SET_ERROR,
          errors: {
            insufficientBalance: false
          }
        })
      }
    }

    dispatch({
      type: types.SEND_VERIFY,
      btnSendDisabled,
      total
    })
  }
}
