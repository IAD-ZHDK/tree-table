import AbstractApplication from 'views/AbstractApplication'
import BoxExampleScene from './scenes/BoxExampleScene'

class Main extends AbstractApplication {
  constructor () {
    super()

    // create box scene and display it
    const boxScene = new BoxExampleScene(this)
    boxScene.setup()
    this.changeScene(boxScene)

    // start animation renderer
    this.animate()
  }
}

export default Main
