import AbstractApplication from 'views/AbstractApplication'
import GUILayer from './layers/GUILayer'
import GlobeLayer from './layers/GlobeLayer'
import MapLayer from './layers/MapLayer'
import TrackingClient from './io/TrackingClient'
import { DefaultLoadingManager } from 'three'

class TableApplication extends AbstractApplication {
  constructor () {
    super()

    // todo: add interval to update clients
    this._trackingClient = new TrackingClient('localhost', 7000)

    // set clear color to transparent
    this.renderer.setClearColor(0xffffff, 0)

    // define scenes
    this.mapLayer = new MapLayer(this, true)
    this.mapLayer.setup()
    this.globeLayer = new GlobeLayer(this)
    this.globeLayer.setup()
    this.GUILayer = new GUILayer(this)
    this.GUILayer.setup()
    const loadingScreen = document.getElementById('loading-screen')

    // inspired by https://jsfiddle.net/8w3deqyg/
    DefaultLoadingManager.onLoad = function () {
      console.log('Loading complete!')
      loadingScreen.classList.add('fade-out')
      // optional: remove loader from DOM via event listener
      loadingScreen.addEventListener('transitionend', onTransitionEnd)
      // add scenes
      this.addLayer(this.globeLayer)
      this.addLayer(this.GUILayer)
      this.addLayer(this.mapLayer)
      // start animation renderer
      this.animate()
    }.bind(this)
  }

  get trackingClient () {
    return this._trackingClient
  }
}
function onTransitionEnd (event) {
  event.target.remove()
}
export default TableApplication
