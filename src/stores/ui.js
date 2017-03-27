import { action, observable, reaction } from 'mobx'
import { hashHistory } from 'react-router'
import { getItem, setItem } from '../utilities/localStorage'
import i18next from '../utilities/i18next'
import moment from 'moment'

/** Required store instances. */
import rpc from './rpc'

class UI {
  /**
   * Observable properties.
   * @property {string} activeRoute - Active route.
   * @property {string} language - Display language.
   */
  @observable activeRoute = '/'
  @observable language = getItem('language') || 'en'

  /**
   * @constructor
   * @property {array} languages - Available languages.
   */
  constructor () {
    this.languages = [
      { name: 'English', language: 'en' },
      { name: 'Slovenian', language: 'sl' }
    ]

    /** Change moment and i18next on locale change. */
    reaction(() => this.language, (language) => {
      i18next.changeLanguage(language)
      moment.locale(language)
    }, true)

    /** Redirect to welcome screen when RPC is unreachable. */
    reaction(() => rpc.ready, (ready) => {
      if (ready === false) {
        this.setRoute('/welcome')
      } else {
        this.setRoute('/')
      }
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
   * Set active route.
   * @action setRoute
   * @param {string} route - Active route.
   */
  @action setRoute (route) {
    this.activeRoute = route
    hashHistory.push(route)
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
