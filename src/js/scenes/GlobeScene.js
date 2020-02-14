import BaseScene from './BaseScene'
import { BoxGeometry, Color, Mesh, MeshBasicMaterial } from 'three'

class GlobeScene extends BaseScene {
  setup () {
    super.setup()

    let geometry = new BoxGeometry(50, 50, 50)
    let material = new MeshBasicMaterial({ color: 0x00ff00 })
    let cube = new Mesh(geometry, material)
    cube.position.x = 200
    this.add(cube)
  }
}

export default GlobeScene
