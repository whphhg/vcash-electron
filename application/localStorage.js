import { ipcRenderer } from 'electron'

export const stateLoad = () => {
  try {
    const serializedState = localStorage.getItem('state')

    if (serializedState === null) {
      process.env.NODE_ENV === 'development' && console.warn('No state to load from localStorage. This is the first run.')
      return undefined
    } else {
      process.env.NODE_ENV === 'development' && console.info('Loaded parts of initial state from localStorage.')
      return JSON.parse(serializedState)
    }
  } catch (exception) {
    process.env.NODE_ENV === 'development' && console.error('Erorr loading parts of state from localStorage.', exception)
    return undefined
  }
}

export const stateSave = (store) => {
  ipcRenderer.on('stateSave', (event, path) => {
    const state = {
      network: {
        nodes: {
          connected: [],
          endpoints: [],
          geoData: store.getState().network.nodes.geoData
        }
      },
      rates: store.getState().rates,
      settings: store.getState().settings,
      watchOnly: {
        addresses: store.getState().watchOnly.addresses,
        byAddress: store.getState().watchOnly.byAddress
      }
    }

    try {
      const serializedState = JSON.stringify(state)
      localStorage.setItem('state', serializedState)

      // Inform main process that the state was saved.
      ipcRenderer.send('stateSaved')
    } catch (exception) {
      process.env.NODE_ENV === 'development' && console.error('Error saving state to localStorage. Press [x] again.', exception)
    }
  })
}
