import BaseLayer from './BaseLayer'
import Stats from 'stats.js'
import Papa from 'papaparse'
import { BufferGeometry, Line, LineBasicMaterial, Sprite, SpriteMaterial, TextureLoader, Vector3 } from 'three'
class GUILayer extends BaseLayer {
  setup () {
    super.setup()
    this.globLayer = this.app.globeLayer
    this.mapLayer = this.app.mapLayer
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
    console.log('something print this yes no yes no yes')
    // adding the full screen button
    if (document.fullscreenElement) {
      // curently fullscreen
    } else {
      this.addFullScreenButton()
    }

    // tactile info
    this._tactileInfo = document.getElementsByClassName('tactileInfo')[0]
  }

  update () {
    this.stats.update()
    // for (let i = 0; i < this.globLayer.POIS.length; i++) {
    // if (this.globLayer.POIS[i].isVisible()) {
    // this.globLayer.CartesianToCanvas(this.globLayer.POIS[i].pos)
    // }
    // }

    // display how many devices are tracked

    // updating the canvas elements
    this.globLayer.POIS.forEach((element, i) => {
      let localPos = this.globLayer.CartesianToCanvas(element.position.x, element.position.y, element.position.z)
      let textBoxes = document.getElementsByClassName('txtBxWrap')
      // eslint-disable-next-line eqeqeq
      if (element.visibility) {
        textBoxes[i].style.opacity = '0.75'
      } else {
        textBoxes[i].style.opacity = '0.05'
      }
      textBoxes[i].style.left = localPos.x + 'px'
      textBoxes[i].style.top = localPos.y + 'px'
    })
    this._tactileInfo.textContent = `Devices: ${this.app.trackingClient.devices.length}`
  }

  async main (context) {
    await context.loadCSV(context)
    await context.makeTestMenu(context)
    this.globLayer.POIS.forEach(element => {
      let position = this.globLayer.CartesianToCanvas(element.position.x, element.position.y, element.position.z)
      let content = element.content
      let title = element.name
      console.log('x' + element.position.x, 'y' + element.position.y, 'z' + element.position.z)
      this.addTextBox(title, content, position.x, position.y)
    })
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

  addTextBox (title, content, x, y) {
    let txtBxWrap = document.createElement('div')
    let textBox = document.createElement('div')
    let textBoxTitle = document.createElement('p')
    txtBxWrap.setAttribute('class', 'txtBxWrap')
    textBox.setAttribute('class', 'textBox')
    textBoxTitle.setAttribute('class', 'textBoxContent')
    textBoxTitle.textContent = title
    let textBoxContent = document.createElement('p')
    textBoxContent.setAttribute('class', 'textBoxContent')
    textBoxContent.textContent = content
    textBox.appendChild(textBoxTitle)
    textBox.appendChild(textBoxContent)
    txtBxWrap.appendChild(textBox)
    document.body.appendChild(txtBxWrap)
    txtBxWrap.style.left = x + 'px'
    txtBxWrap.style.top = y + 'px'
  }

  addFullScreenButton () {
    let button = document.createElement('FullScreenButton')
    button.innerHTML = '[ + ]'
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
            context.globLayer.newPOI(context.results[i].lat, context.results[i].lon, context.results[i].name, context.results[i].text)
          }
          resolve()
        }
      })
    })
  }
}
export default GUILayer
