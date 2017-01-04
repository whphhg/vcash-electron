import { action, autorun, observable, reaction } from 'mobx'
import { hashHistory } from 'react-router'
import { getItem, setItem } from '../utilities/localStorage'
import i18next from '../utilities/i18next'
import moment from 'moment'

class UI {
  /**
   * Observable properties.
   * @property {string} activeRoute - Active route.
   * @property {string} language - Interface language.
   */
  @observable activeRoute = '/'
  @observable language = getItem('language') || 'en'

  /**
   * @constructor
   * @property {array} languages - Available translations.
   */
  constructor () {
    this.languages = [
      { name: 'English', lng: 'en' },
      { name: 'Slovenian', lng: 'sl' }
    ]

    /** Set moment.js locale. */
    autorun(() => {
      moment.locale(this.language)
    })

    /** React to language change. */
    reaction(() => this.language, (language) => {
      i18next.changeLanguage(language)
    })
  }

  /**
   * Set active route.
   * @function setRoute
   * @param {string} route - Active route.
   */
  @action setRoute (route) {
    this.activeRoute = route
    hashHistory.push(route)
  }

  /**
   * Set interface language.
   * @function setLanguage
   * @param {string} language - Language.
   */
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
