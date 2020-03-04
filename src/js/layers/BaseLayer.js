import { OrthographicCamera, PerspectiveCamera, Scene } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

class BaseLayer {
  constructor (app, Orthographic) {
    this._app = app
    this._active = true
    this._scene = new Scene()

    this.Orthographic = Orthographic || false
    let width = window.innerWidth
    let height = window.innerHeight
    if (this.Orthographic) {
      this._camera = new OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0, 1000)
    } else {
      this._camera = new PerspectiveCamera(70, width / height, 1, 5000)
      this._controls = new OrbitControls(this._camera, app.renderer.domElement)
    }
  }

  setup () {
    if (this.Orthographic) {
      this._camera.position.z = 100
    } else {
      // camera defaults
      this._camera.position.z = 200
      // controls defaults
      this._controls.enableDamping = true
      this._controls.dampingFactor = 0.25
      this._controls.enableZoom = true
    }
  }

  update () {

  }

  get app () {
    return this._app
  }

  get scene () {
    return this._scene
  }

  get camera () {
    return this._camera
  }

  get controls () {
    return this._controls
  }

  get active () {
    return this._active
  }

  set active (value) {
    this._active = value
  }
}

export default BaseLayer
