import { action, extendObservable, reaction } from 'mobx'
import { getItem, setItem } from '../utilities/localStorage'
import i18next from '../utilities/i18next'
import moment from 'moment'

class GUI {
  /**
   * @constructor
   * @property {array} languages - Available languages.
   */
  constructor() {
    this.languages = [
      { language: 'en-US', name: 'English' },
      { language: 'fr-FR', name: 'French' },
      { language: 'pt-BR', name: 'Portuguese' },
      { language: 'ru-RU', name: 'Russian' },
      { language: 'sl-SI', name: 'Slovenian' },
      { language: 'es-ES', name: 'Spanish' }
    ]

    /** Extend the store with observable properties. */
    extendObservable(this, {
      language: getItem('language') || 'en-US',
      localCurrency: getItem('localCurrency') || 'EUR',
      soundAlerts: getItem('soundAlerts') || {
        incoming: false,
        spendable: false
      }
    })

    /** Update i18next and moment on locale change. */
    reaction(
      () => this.language,
      language => {
        i18next.changeLanguage(language)
        moment.locale(language)
      },
      true
    )
  }

  /**
   * Set display language and save it to local storage.
   * @function setLanguage
   * @param {string} language - Display language.
   */
  @action
  setLanguage(language) {
    this.language = language
    setItem('language', this.language)
  }

  /**
   * Set local currency and save it to local storage.
   * @function setLocalCurrency
   * @param {string} localCurrency - Local currency.
   */
  @action
  setLocalCurrency(localCurrency) {
    this.localCurrency = localCurrency
    setItem('localCurrency', this.localCurrency)
  }

  /**
   * Set sound alert and save it to local storage.
   * @function setSoundAlert
   * @param {string} alert - Alert to toggle.
   */
  @action
  setSoundAlert(alert) {
    this.soundAlerts[alert] = !this.soundAlerts[alert]
    setItem('soundAlerts', this.soundAlerts)
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
