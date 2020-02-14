import { Scene } from 'three'

class BaseScene extends Scene {
  constructor (app) {
    super()
    this._app = app
  }

  setup () {

  }

  update () {

  }

  start () {

  }

  stop () {

  }

  get app () {
    return this._app
  }
}

export default BaseScene
