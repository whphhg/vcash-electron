import { action, observable, reaction } from 'mobx'
import { hashHistory } from 'react-router'
import { getItem, setItem } from '../utilities/localStorage'
import i18next from '../utilities/i18next'
import moment from 'moment'

class UI {
  @observable activeRoute = '/'
  @observable language = getItem('language') || 'en'

  constructor () {
    this.languages = [
      { name: 'English', language: 'en' },
      { name: 'Slovenian', language: 'sl' }
    ]

    reaction(() => this.language, (language) => {
      i18next.changeLanguage(language)
      moment.locale(language)
    }, true)
  }

  @action setRoute (route) {
    this.activeRoute = route
    hashHistory.push(route)
  }

  @action setLanguage (language) {
    this.language = language
    setItem('language', language)
  }
}

/** Initialize a new globally used store. */
const ui = new UI()

/**
 * Export initialized store as default export,
 * and store class as named export.
 */
export default ui
export { UI }
