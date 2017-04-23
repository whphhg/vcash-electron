import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Select } from 'antd'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('gui') @observer

export default class SelectLanguage extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
  }

  /**
   * Set display language.
   * @function setLanguage
   * @param {string} language - Locale.
   */
  setLanguage = (language) => {
    this.gui.setLanguage(language)
  }

  render () {
    return (
      <Select
        defaultValue={this.gui.language}
        notFoundContent={this.t('wallet:notFound')}
        onChange={this.setLanguage}
        optionFilterProp='children'
        showSearch
        size='small'
        style={{width: '120px'}}
      >
        {
          this.gui.languages.map((entry) => (
            <Select.Option key={entry.language} value={entry.language}>
              {entry.name}
            </Select.Option>
          ))
        }
      </Select>
    )
  }
}
