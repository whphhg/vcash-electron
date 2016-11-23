import { action, observable } from 'mobx'
import { hashHistory } from 'react-router'

class UI {
  /**
   * Observable properties.
   * @property {string} activeRoute - Active route.
   */
  @observable activeRoute = '/'

  /**
   * Set active route.
   * @function setRoute
   * @param {string} route - Active route.
   */
  @action setRoute(route) {
    this.activeRoute = route
    hashHistory.push(route)
  }
}

/** Initialize a new globally used store. */
const ui = new UI()

/** Export both, initialized store as default export, and store class as named export. */
export default ui
export { UI }
