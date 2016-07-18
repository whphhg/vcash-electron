import React from 'react'
import { render } from 'react-dom'
import Root from './components/Root'

import configureStore from './configureStore'

render(
  <Root store={configureStore()} />,
  document.getElementById('application-root')
)
