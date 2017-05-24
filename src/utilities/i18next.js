import i18next from 'i18next'
import backend from 'i18next-node-fs-backend'
import { getItem } from '../utilities/localStorage'
import { readdirSync } from 'fs'
import { join } from 'path'

/**
 * Start i18next.
 * @function start
 * @return {object} i18next instance.
 */
const start = () => {
  /** Get available languages. */
  const languages = readdirSync(join(__dirname, '..', 'locales'))

  /** Get saved language. */
  let fallbackLng = getItem('language')

  /** Check if the language exists or revert to default. */
  fallbackLng = languages.includes(fallbackLng) === true
    ? fallbackLng
    : 'en-US'

  /** Initialize a i18next instance. */
  return i18next
    .use(backend)
    .init({
      fallbackLng,
      ns: ['wallet'],
      defaultNS: 'wallet',
      debug: process.env.NODE_ENV === 'dev',
      backend: {
        loadPath: join(__dirname, '..', 'locales', '{{lng}}', '{{ns}}.json'),
        addPath: join(__dirname, '..', 'locales', '{{lng}}', '{{ns}}.missing.json'),
        jsonIndent: 2
      },
      load: 'currentOnly',
      languages,
      interpolation: { escapeValue: false }
    })
}

/** Export i18next instance. */
export default start()
