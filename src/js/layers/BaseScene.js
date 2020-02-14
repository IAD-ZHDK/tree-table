import { Scene } from 'three'

class BaseScene extends Scene {
  constructor (app) {
    super()
    this._app = app
    this._active = true
  }

  setup () {

  }

  update () {

  }

  get app () {
    return this._app
  }

  get active () {
    return this._active
  }

  set active (value) {
    this._active = value
  }
}

export default BaseScene
