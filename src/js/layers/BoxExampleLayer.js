import BaseLayer from './BaseLayer'
import { BoxGeometry, Mesh, MeshBasicMaterial, TextureLoader } from 'three'

class BoxExampleLayer extends BaseLayer {
  setup () {
    super.setup()
    const texture = new TextureLoader().load('static/textures/crate.gif')
    const geometry = new BoxGeometry(200, 200, 200)
    const material = new MeshBasicMaterial({ map: texture })
    this._mesh = new Mesh(geometry, material)
    this.scene.add(this._mesh)
  }
}
export default BoxExampleLayer
