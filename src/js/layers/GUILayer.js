import BaseLayer from './BaseLayer'
import Stats from 'stats.js'
import Papa from 'papaparse'
import { Sprite, SpriteMaterial, TextureLoader } from 'three'

class GUILayer extends BaseLayer {
  setup (globLayer) {
    super.setup()
    this.globLayer = globLayer
    /* controls */
    this.controls.enableRotate = false
    this.controls.enableZoom = false
    this.controls.enablePan = false
    this.controls.minDistance = 0
    this.controls.maxDistance = 10
    this._camera.position.z = 1
    /* import Points of Interest data */
    /* create menu after loading data */
    this.main(this)
    /* add fps stats */
    this.stats = new Stats()
    this.stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(this.stats.domElement)
  }

  update () {
    this.stats.update()
    for (let i = 0; i < this.globLayer.POIS.length; i++) {
      if (this.globLayer.POIS[i].visible) {
        this.globLayer.CartesianToCanvas(this.globLayer.POIS[i].pos)
      }
    }
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
            context.globLayer.animateToPoint(context.results[i].lat, context.results[i].lon)
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
        context.globLayer.dataVisible(value)
      })
      context.gui.open()
      resolve()
    })
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
