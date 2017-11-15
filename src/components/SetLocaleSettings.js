import React from 'react'
import { translate } from 'react-i18next'

/** Components */
import SetCurrency from './SetCurrency'
import SetLanguage from './SetLanguage'

@translate(['wallet'])
class SetLocaleSettings extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
  }

  render() {
    return (
      <div>
        <div className="flex-sb" style={{ margin: '0 0 5px 0' }}>
          <div className="flex">
            <i className="material-icons md-16">language</i>
            <p>{this.t('language')}</p>
          </div>
          <SetLanguage />
        </div>
        <div className="flex-sb">
          <div className="flex">
            <i className="material-icons md-16">monetization_on</i>
            <p>{this.t('localCurrency')}</p>
          </div>
          <SetCurrency />
        </div>
      </div>
    )
  }
}

export default SetLocaleSettings
