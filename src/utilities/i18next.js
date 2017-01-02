import i18next from 'i18next'
import backend from 'i18next-node-fs-backend'
import { getItem } from '../utilities/localStorage'
import { join } from 'path'

/** Initialize an i18next instance. */
i18next
  .use(backend)
  .init({
    fallbackLng: getItem('language') || 'en',
    ns: ['wallet'],
    defaultNS: 'wallet',
    debug: process.env.NODE_ENV === 'dev',
    backend: {
      loadPath: join(__dirname, '/../locales/{{lng}}/{{ns}}.json'),
      addPath: join(__dirname, '/../locales/{{lng}}/{{ns}}.missing.json'),
      jsonIndent: 2
    },
    load: 'current',
    languages: ['en', 'sl'],
    interpolation: {
      escapeValue: false
    }
  })

export default i18next
