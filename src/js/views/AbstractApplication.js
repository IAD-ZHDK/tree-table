import { PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import BaseScene from '../layers/BaseScene'

class AbstractApplication {
  constructor () {
    this._camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 5000)
    this._camera.position.z = 400

    this._scenes = []

    this._renderer = new WebGLRenderer()
    this._renderer.autoClear = false
    this._renderer.setPixelRatio(window.devicePixelRatio)
    this._renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(this._renderer.domElement)

    this._controls = new OrbitControls(this._camera, this._renderer.domElement)
    // this._controls.addEventListener( 'change', render ) // add this only if there is no animation loop (requestAnimationFrame)
    this._controls.enableDamping = true
    this._controls.dampingFactor = 0.25
    this._controls.enableZoom = false

    window.addEventListener('resize', this.onWindowResize.bind(this), false)
  }

  get renderer () {
    return this._renderer
  }

  get camera () {
    return this._camera
  }

  get scenes () {
    return this._scenes
  }

  addScene (scene) {
    this._scenes.push(scene)
  }

  onWindowResize () {
    this._camera.aspect = window.innerWidth / window.innerHeight
    this._camera.updateProjectionMatrix()

    this._renderer.setSize(window.innerWidth, window.innerHeight)
  }

  animate (timestamp) {
    requestAnimationFrame(this.animate.bind(this))

    this._renderer.clear()
    for (let scene of this._scenes) {
      if (scene.active) {
        scene.update()
        this._renderer.render(scene, this._camera)
      }
    }
  }
}

export default AbstractApplication
