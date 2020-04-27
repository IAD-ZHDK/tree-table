import BaseLayer from './BaseLayer'
import Stats from 'stats.js'
import Papa from 'papaparse'
import GeoUtil from '../utils/GeoUtil.js'
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
    // display how many devices are tracked
    /* Info Cards */
    let infoCards = document.getElementsByClassName('infoCardWrap')
    if (!this.mapLayer.isVisible) {
      this.globLayer.POIS.forEach((element, i) => {
        let localPos = GeoUtil.CartesianToCanvas(element.position.x, element.position.y, element.position.z, this.globLayer._camera)
        // eslint-disable-next-line eqeqeq
        infoCards[i].classList.remove('disabledCard')
        if (element.visibility) {
          // infoCards[i].style.opacity = '0.5'
          infoCards[i].classList.add('visibleCard')
          infoCards[i].classList.remove('invisibleCard')
        } else {
          // infoCards[i].style.opacity = '0.05'
          infoCards[i].classList.remove('visibleCard')
          infoCards[i].classList.add('invisibleCard')
          // infoCards[i].removeEventListener('click', function () { })
          infoCards[i].classList.remove('openCard')
        }
        infoCards[i].style.left = localPos.x + 'px'
        infoCards[i].style.top = localPos.y + 'px'
      })
    } else {
      this.globLayer.POIS.forEach((element, i) => {
        infoCards[i].classList.add('disabledCard')
      })
    }
    this._tactileInfo.textContent = `Devices: ${this.app.trackingClient.devices.length}`
  }

  async main (context) {
    await context.loadCSV(context)
    await context.makeTestMenu(context)
    this.globLayer.POIS.forEach(element => {
      let position = GeoUtil.CartesianToCanvas(element.position.x, element.position.y, element.position.z, this.globLayer._camera)
      let content = element.content
      let title = element.name
      console.log('x' + element.position.x, 'y' + element.position.y, 'z' + element.position.z)
      this.addInfoCard(title, content, position.x, position.y)
    })
  }

  makeTestMenu (context) {
    /* simple gui */
    return new Promise(function (resolve) {
      /* locations */
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
      /* data visuals */
      let settings = {
        checkbox: false
      }
      let datavis = context.gui.addFolder('Data Visual')
      datavis.add(settings, 'checkbox').onChange(function (value) {
        context.globLayer.showData(value)
      })
      /* graphic style */
      let style = context.gui.addFolder('Visual Style')
      let parameters =
        {
          f: function () {
            context.globLayer.changeStyle(0)
          }
        }
      style.add(parameters, 'f').name('Visual 2D')
      parameters =
        {
          g: function () {
            context.globLayer.changeStyle(1)
          }
        }
      style.add(parameters, 'g').name('Blue marble')

      /* 2D map */
      let map2D = context.gui.addFolder('Map 2D')
      map2D.add(settings, 'checkbox').onChange(function (value) {
        // context.globLayer.animateToPoint(0, 0)
        context.mapLayer.showMap(value)
      })
      context.gui.open()
      resolve()
    })
  }

  addInfoCard (title, content, x, y) {
    let infoCardWrap = document.createElement('div')
    let infoCard = document.createElement('div')
    let infoCardTitle = document.createElement('p')
    infoCardWrap.setAttribute('class', 'infoCardWrap')
    infoCard.setAttribute('class', 'infoCard')
    infoCardTitle.setAttribute('class', 'infoCardContent')
    infoCardTitle.textContent = title
    let infoCardContent = document.createElement('p')
    infoCardContent.setAttribute('class', 'infoCardContent')
    infoCardContent.textContent = content
    infoCard.appendChild(infoCardTitle)
    infoCard.appendChild(infoCardContent)
    infoCardWrap.appendChild(infoCard)
    document.body.appendChild(infoCardWrap)
    infoCardWrap.addEventListener('click', function () {
      infoCardWrap.classList.toggle('openCard')
    })
    infoCardWrap.style.left = x + 'px'
    infoCardWrap.style.top = y + 'px'
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
