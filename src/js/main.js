import {
  BoxGeometry,
  Mesh,
  TextureLoader,
  MeshBasicMaterial
} from 'three'
import AbstractApplication from 'views/AbstractApplication'

class Main extends AbstractApplication {
  constructor () {
    super()

    const texture = new TextureLoader().load('static/textures/crate.gif')

    const geometry = new BoxGeometry(200, 200, 200)
    const material = new MeshBasicMaterial({ map: texture })

    this._mesh = new Mesh(geometry, material)
    this._scene.add(this._mesh)

    this.animate()
  }
}

export default Main
