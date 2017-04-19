import { action, observable, reaction } from 'mobx'
import { getItem, setItem } from '../utilities/localStorage'
import i18next from '../utilities/i18next'
import moment from 'moment'

class GUI {
  /**
   * Observable properties.
   * @property {string} language - Display language.
   * @property {string} localCurrency - Local currency.
   */
  @observable language = getItem('language') || 'en'
  @observable localCurrency = getItem('localCurrency') || 'EUR'

  /**
   * @constructor
   * @property {array} languages - Available languages.
   */
  constructor () {
    this.languages = [
      { name: 'English', language: 'en' },
      { name: 'Portuguese', language: 'pt' },
      { name: 'Slovenian', language: 'sl' }
    ]

    /** Change moment and i18next on locale change. */
    reaction(() => this.language, (language) => {
      i18next.changeLanguage(language)
      moment.locale(language)
    }, true)
  }

  /**
   * Set display language.
   * @action setLanguage
   * @param {string} language - Display language.
   */
  @action setLanguage (language) {
    this.language = language

    /** Save to local storage. */
    setItem('language', language)
  }

  /**
   * Set local currency.
   * @function setLocalCurrency
   * @param {string} localCurrency - Local currency.
   */
  @action setLocalCurrency (localCurrency) {
    this.localCurrency = localCurrency

    /** Save to local storage. */
    setItem('localCurrency', localCurrency)
  }
}

/** Initialize a new globally used store. */
const gui = new GUI()

/**
 * Export initialized store as default export,
 * and store class as named export.
 */
export default gui
export { GUI }
