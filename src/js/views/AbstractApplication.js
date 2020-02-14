import { PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import BaseLayer from '../layers/BaseLayer'

class AbstractApplication {
  constructor () {
    this._layers = []

    this._renderer = new WebGLRenderer()
    this._renderer.autoClear = false
    this._renderer.setPixelRatio(window.devicePixelRatio)
    this._renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(this._renderer.domElement)

    window.addEventListener('resize', this.onWindowResize.bind(this), false)
  }

  get renderer () {
    return this._renderer
  }

  get layers () {
    return this._layers
  }

  addLayer (scene) {
    this._layers.push(scene)
  }

  onWindowResize () {
    for (let layer of this._layers) {
      layer.camera.aspect = window.innerWidth / window.innerHeight
      layer.camera.updateProjectionMatrix()
    }

    this._renderer.setSize(window.innerWidth, window.innerHeight)
  }

  animate (timestamp) {
    requestAnimationFrame(this.animate.bind(this))

    this._renderer.clear()
    for (let layer of this._layers) {
      if (layer.active) {
        layer.update()
        this._renderer.render(layer.scene, layer.camera)
      }
    }
  }
}

export default AbstractApplication
