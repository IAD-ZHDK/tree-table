import BaseLayer from './BaseLayer'
import {
  SpriteMaterial,
  TextureLoader,
  Sprite,
  OrthographicCamera, Scene
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

class MapLayer {
  constructor (app) {
    this._app = app
    this._active = true
    this._scene = new Scene()
    let width = window.innerWidth
    let height = window.innerHeight
    this._camera = new OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0, 1000)
  }
  setup () {
    this._camera.position.z = 10
    let spriteMap = new TextureLoader().load('static/textures/earthspec1k.jpg')
    let spriteMaterial = new SpriteMaterial({ map: spriteMap, color: 0xffffff })
    this.sprite = new Sprite(spriteMaterial)
    let width = window.innerWidth
    let height = window.innerHeight
    this.sprite.center.set(0.5, 0.5)
    this.sprite.scale.set(width, height, 8000)
    this._scene.add(this.sprite)
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

export default MapLayer
