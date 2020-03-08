import BaseLayer from './BaseLayer'
import Stats from 'stats.js'
import Papa from 'papaparse'
import { BufferGeometry, Line, LineBasicMaterial, Sprite, SpriteMaterial, TextureLoader, Vector3 } from 'three'
class GUILayer extends BaseLayer {
  setup () {
    super.setup()
    this.globLayer = this._app.globeLayer
    this.mapLayer = this._app.mapLayer
    /* Controls */
    this.controls.enableRotate = false
    this.controls.enableZoom = false
    this.controls.enablePan = false
    this.controls.minDistance = 0
    this.controls.maxDistance = 10
    this._camera.position.z = 1

    /* import Points of Interest data */
    /* create menu after loading data */
    this.main(this)

    /* Add FPS stats */
    this.stats = new Stats()
    this.stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(this.stats.domElement)

    /* Text Boxes */
    // possible inspiration: https://manu.ninja/webgl-three-js-annotations
    if (document.fullscreenElement) {
      // curently fullscreen
    } else {
      this.addFullScreenButton()
    }
  }

  update () {
    this.stats.update()
    // for (let i = 0; i < this.globLayer.POIS.length; i++) {
    // if (this.globLayer.POIS[i].isVisible()) {
    // this.globLayer.CartesianToCanvas(this.globLayer.POIS[i].pos)
    // }
    // }
  }

  async main (context) {
    await context.loadCSV(context)
    await context.makeTestMenu(context)
  }

  makeTestMenu (context) {
    /* simple gui */
    return new Promise(function (resolve) {
      const dat = require('dat.gui')
      context.gui = new dat.GUI()
      let loc = context.gui.addFolder('locations')
      for (let i = 0; i < context.results.length - 1; i++) {
        let parameters =
        {
          f: function () {
            let options = { lat: context.results[i].lat, lon: context.results[i].lon }
            context.globLayer.animateToPoint(options)
          }
        }
        loc.add(parameters, 'f').name(context.results[i].name)
      }
      //
      let settings = {
        checkbox: false
      }
      let datavis = context.gui.addFolder('data visual')
      datavis.add(settings, 'checkbox').onChange(function (value) {
        context.globLayer.showData(value)
      })
      let map2D = context.gui.addFolder('Map 2D')
      map2D.add(settings, 'checkbox').onChange(function (value) {
        // context.globLayer.animateToPoint(0, 0)
        context.mapLayer.showMap(value)
      })
      context.gui.open()
      resolve()
    })
  }

  addFullScreenButton () {
    let button = document.createElement('FullScreenButton')
    button.innerHTML = 'Open FullScreen'
    let body = document.getElementsByTagName('body')[0]
    body.insertBefore(button, body.childNodes[0])
    button.addEventListener('click', function () {
      this.openFullscreen()
      button.remove()
    }.bind(this))
  }

  openFullscreen () {
    let elem = document.documentElement
    if (elem.requestFullscreen) {
      elem.requestFullscreen()
    } else if (elem.mozRequestFullScreen) { /* Firefox */
      elem.mozRequestFullScreen()
    } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
      elem.webkitRequestFullscreen()
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
      elem.msRequestFullscreen()
    }
  }

  async loadCSV (context) {
    return new Promise(function (resolve) {
      const url = 'static/location_data/POI.csv'
      const csvData = Papa.parse(url, {
        dynamicTyping: true,
        download: true,
        header: true,
        comments: '*=',
        complete: function (data) {
          context.results = data.data
          for (let i = 0; i < context.results.length - 1; i++) {
            context.globLayer.newPOI(context.results[i].lat, context.results[i].lon, context.results[i].name)
          }
          resolve()
        }
      })
    })
  }
}
export default GUILayer
