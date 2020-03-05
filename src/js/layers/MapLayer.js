import BaseLayer from './BaseLayer'
import {
  SpriteMaterial,
  TextureLoader,
  Sprite,
  OrthographicCamera, Scene, Mesh, SphereGeometry, BoxGeometry, MeshBasicMaterial, Shape, ShapeBufferGeometry, MeshPhongMaterial, Vector3
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import TWEEN from '@tweenjs/tween.js'

class MapLayer extends BaseLayer {
  setup () {
    /* MASK EFFECT */
    this._app._renderer.setClearColor(0xe5e5e5)
    this._app.renderer.autoClear = false
    this._scene2 = new Scene()
    this._camera.position.z = 100
    let spriteMap = new TextureLoader().load('static/textures/earthMono_8192 _4096.jpg')
    let spriteMaterial = new SpriteMaterial({ map: spriteMap, color: 0xffffff })
    this.sprite = new Sprite(spriteMaterial)
    let width = window.innerWidth
    let height = window.innerHeight
    this.sprite.center.set(0.5, 0.5)
    this.sprite.scale.set(width, height, 8000)
    this._scene.add(this.sprite)
    this.sprite.visible = false
    /* Mask object  */

    let maskShape = new Shape()
      .moveTo(-width / 2, -height / 2)
      .lineTo(-width / 2, height / 2)
      .lineTo(width / 2, height / 2)
      .lineTo(width / 2, -height / 2)
      .lineTo(-width / 2, -height / 2)
    let maskHole = new Shape()
      .moveTo(0, 0)
      .absarc(0, 0, 20, 0, Math.PI * 2, true)

    maskShape.holes.push(maskHole)
    let geometry = new ShapeBufferGeometry(maskShape)
    this.maskMesh = new Mesh(geometry, new MeshPhongMaterial())
    this.maskMesh.position.z = 10
    this.maskMesh.geometry.center()
    this._scene2.add(this.maskMesh)
    this.maskMesh.geometry.computeBoundingBox()
    this.maskMesh.geometry.center()
    this.maskScale = new Vector3(1, 1, 1)
    this.MapTween = new TWEEN.Tween()
    this.showMap(false)
  }

  update () {
    this.maskMesh.scale.set(this.maskScale.x, this.maskScale.y, 1)
    this._app.renderer.getContext().colorMask(false, false, false, true) // R, G, B, A
    this._app.renderer.render(this._scene2, this._camera)
    this._app.renderer.getContext().colorMask(true, true, true, true)
    this._app.renderer.render(this._scene, this._camera)
    TWEEN.update()
  }

  showMap (bool) {
    //
    if (bool) {
      if (this._app.globeLayer) {
        let options = { lat: 0, lon: 0, distance: 250 }
        this.globeTween = this._app.globeLayer.animateToPoint(options)
        this.globeTween.onComplete(function () {
          this.MapTween.start()
        }.bind(this))
      }
      this.MapTween.stop()
      let newPosition = new Vector3(65, 65, 1)
      // const duration = Math.abs(newPosition.length - this.maskScale.length) * 100
      this.MapTween = new TWEEN.Tween(this.maskScale).to(newPosition, 1000)
      this.MapTween.easing(TWEEN.Easing.Circular.In)
      this.MapTween.onStart(function () {
        this.sprite.visible = true
      }.bind(this))
    } else {
      this.MapTween.stop()
      if (this.globeTween) {
        this.globeTween.stop()
      }
      let newPosition = new Vector3(1, 1, 1)
      this.MapTween = new TWEEN.Tween(this.maskScale).to(newPosition, 1000).start()
      this.MapTween.easing(TWEEN.Easing.Circular.In)
      this.MapTween.onComplete(function () {
        this.sprite.visible = false
      }.bind(this))
    }
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
