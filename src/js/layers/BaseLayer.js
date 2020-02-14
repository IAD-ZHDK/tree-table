import { Scene } from 'three'

class BaseLayer {
  constructor (app) {
    this._app = app
    this._active = true
    this._scene = new Scene()
  }

  setup () {

  }

  update () {

  }

  get app () {
    return this._app
  }

  get scene () {
    return this._scene
  }

  get active () {
    return this._active
  }

  set active (value) {
    this._active = value
  }
}

export default BaseLayer
