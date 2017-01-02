import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Select } from 'antd'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('ui') @observer

class SelectLanguage extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.ui = props.ui
    this.setLanguage = this.setLanguage.bind(this)
  }

  setLanguage (value) {
    this.ui.setLanguage(value)
  }

  render () {
    return (
      <Select
        showSearch
        style={{width: '120px', margin: '0 10px 0 0'}}
        defaultValue={this.ui.language}
        optionFilterProp='children'
        notFoundContent={this.t('wallet:notFound')}
        onChange={this.setLanguage}
      >
        {
          this.ui.languages.map((entry) => (
            <Select.Option
              key={entry.lng}
              value={entry.lng}
            >
              {entry.name}
            </Select.Option>
          ))
        }
      </Select>
    )
  }
}

export default SelectLanguage
