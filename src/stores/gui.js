import { action, extendObservable, reaction } from 'mobx'
import { join } from 'path'
import { getItem, setItem } from '../utilities/localStorage.js'
import { debounce } from '../utilities/common.js'
import i18next from '../utilities/i18next.js'
import moment from 'moment'

class GUI {
  /**
   * @prop {array} languages - Available languages.
   * @prop {string} soundsDir - Directory with notification sounds.
   * @prop {object} sounds - Loaded notification audio elements.
   * @prop {string} language - Selected language.
   * @prop {string} localCurrency - Selected local currency.
   * @prop {object} soundAlerts - Sound alert settings.
   * @prop {object} window - Window height and width.
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

    /** Load notification sounds. */
    this.soundsDir = join(__dirname, '..', 'assets', 'sounds')
    this.sounds = {
      incoming: new Audio(join(this.soundsDir, 'incoming.mp3')),
      spendable: new Audio(join(this.soundsDir, 'spendable.mp3'))
    }

    /** Extend the store with observable properties. */
    extendObservable(this, {
      language: getItem('language') || 'en-US',
      localCurrency: getItem('localCurrency') || 'EUR',
      soundAlerts: getItem('soundAlerts') || {
        incoming: false,
        spendable: false
      },
      window: { height: window.innerHeight, width: window.innerWidth }
    })

    /** Update i18next and moment on language change. */
    reaction(
      () => this.language,
      language => {
        i18next.changeLanguage(language)
        moment.locale(language)
      },
      {
        fireImmediately: true,
        name: 'GUI: language changed, updating i18next and moment.'
      }
    )

    /** Update window size on resize. */
    window.addEventListener(
      'resize',
      debounce(
        () => this.setWindowSize(window.innerHeight, window.innerWidth),
        0.1 * 1000
      ),
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

  /**
   * Set window height and width.
   * @function setWindowSize
   * @param {number} height - Window height.
   * @param {number} width - Window width.
   */
  @action
  setWindowSize(height, width) {
    this.window.height = height
    this.window.width = width
  }
}

/** Initialize a new globally used store. */
const gui = new GUI()

/** Export initialized store as default export & store class as named export. */
export default gui
export { GUI }
