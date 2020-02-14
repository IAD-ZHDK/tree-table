import AbstractApplication from 'views/AbstractApplication'
import BoxExampleScene from './scenes/BoxExampleScene'
import GlobeScene from './scenes/GlobeScene'

class Main extends AbstractApplication {
  constructor () {
    super()

    this.renderer.setClearColor(0xffffff, 0)

    // define scenes
    this.globeScene = new GlobeScene(this)
    this.globeScene.setup()

    this.boxExampleScene = new BoxExampleScene(this)
    this.boxExampleScene.setup()

    // add scenes
    this.addScene(this.boxExampleScene)
    this.addScene(this.globeScene)

    // start animation renderer
    this.animate()
  }
}

export default Main
