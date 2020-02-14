import BaseScene from './BaseScene'
import { SphereGeometry, Color, Mesh, MeshBasicMaterial } from 'three'

class GlobeScene extends BaseScene {
  setup () {
    super.setup()

    let geometry = new SphereGeometry(200, 50, 50)
    let material = new MeshBasicMaterial({ color: 0x00ff00 })
    let Earth = new Mesh(geometry, material)
    Earth.position.x = 0
    this.add(Earth)
  }
}

export default GlobeScene
