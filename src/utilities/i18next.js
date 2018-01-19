import i18next from 'i18next'
import backend from 'i18next-node-fs-backend'
import { readdirSync } from 'fs'
import { join } from 'path'
import { getItem } from '../utilities/localStorage.js'

/**
 * Initialize a new globally used i18next instance.
 * @function i18n
 * @return {object} i18next instance.
 */
const i18n = (() => {
  /** Get available languages. */
  const languages = readdirSync(join(__dirname, '..', 'locales'))

  /** Get language saved in local storage. */
  let fallbackLng = getItem('language')

  /** Check if the language exists or revert to default. */
  fallbackLng = languages.includes(fallbackLng) === true ? fallbackLng : 'en-US'

  /** Initialize a i18next instance. */
  return i18next.use(backend).init({
    backend: {
      loadPath: join(__dirname, '..', 'locales', '{{lng}}', '{{ns}}.json'),
      addPath: join(__dirname, '..', 'locales', '{{lng}}', '{{ns}}.miss.json'),
      jsonIndent: 2
    },
    debug: process.env.NODE_ENV === 'dev',
    defaultNS: 'common',
    fallbackLng,
    interpolation: { escapeValue: false },
    languages,
    load: 'currentOnly',
    ns: ['common'],
    react: {
      bindI18n: 'languageChanged',
      bindStore: false,
      wait: true
    }
  })
})()

/** Export the initialized instance as default export. */
export default i18n
