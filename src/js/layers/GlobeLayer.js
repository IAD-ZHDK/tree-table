import BaseLayer from './BaseLayer'
import POI from '../model/POI.js'
import DataPoint from '../model/DataPoint.js'
import GeoUtil from '../utils/GeoUtil.js'
import {
  SphereGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  TextureLoader,
  BackSide,
  Vector3,
  OctahedronGeometry,
  SpotLight,
  AmbientLight,
  Matrix4,
  VertexColors,
  Raycaster
} from 'three'
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import TWEEN from '@tweenjs/tween.js'

class GlobeLayer extends BaseLayer {
  setup () {
    super.setup()
    this.EarthRadius = 100
    /* controls */
    // disable zoom for globe
    // todo: there are is a bug on safari, after enabling or disabling visualisation, controls become extreemely lagy
    this.controls.enablePan = false
    this.controls.minDistance = this.EarthRadius + 1
    this.controls.maxDistance = this.EarthRadius * 30.5
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.01
    this.controls.zoomSpeed = 0.3
    window.addEventListener('mousedown', function (event) {
      this.onDocumentPress(event)
    }.bind(this), false)
    window.addEventListener('ontouchstart', function (event) {
      this.onDocumentPress(event)
    }.bind(this), false)

    /* earth */
    const EarthTexture = new TextureLoader().load('static/textures/earthMono_16384_8192_blue_compressed.jpg' +
      '')
    let EarthGeometry = new SphereGeometry(this.EarthRadius, 100, 100)
    let EarthMaterial = new MeshPhongMaterial({ map: EarthTexture })
    // bump map
    // EarthMaterial.bumpMap = new TextureLoader().load('static/textures/gebco_08_rev_elev.png' +
    //  '')
    // specular reflection
    EarthMaterial.specularMap = new TextureLoader().load('static/textures/earthSpec_512_256.jpg' +
      '')
    EarthMaterial.shininess = 50
    // EarthMaterial.bumpScale = 20
    this.Earth = new Mesh(EarthGeometry, EarthMaterial)
    this.Earth.position.x = 0
    this.scene.add(this.Earth)

    /* stars */
    const StarTexture = new TextureLoader().load('static/textures/sky_r.jpg')
    let StarGeometry = new SphereGeometry(4200, 10, 10)
    let StarMaterial = new MeshBasicMaterial({ side: BackSide, map: StarTexture })
    this.Star = new Mesh(StarGeometry, StarMaterial)
    this.Star.position.x = 0
    this.scene.add(this.Star)
    this.Star.castShadow = false

    /* lights */
    this.light = new AmbientLight(0xffffff, 0.9)
    this.scene.add(this.light)
    this.spotLight = new SpotLight(0xff99dd, 0.75, 2000, 10, 2)
    this.spotLight.castShadow = true
    this.spotLight.position.set(200, 0, 100)
    this.spotLight.angle = 1.05
    this.Earth.receiveShadow = true
    this.Earth.castShadow = true
    this.spotLight2 = new SpotLight(0xff99dd, 0.75, 2000, -10, 1)
    this.spotLight2.castShadow = true
    this.spotLight2.position.set(-200, 0, -100)
    this.spotLight2.angle = -1.05
    // this.Earth.receiveShadow = true
    // this.Earth.castShadow = true
    this.scene.add(this.spotLight2)
    this.scene.add(this.spotLight)

    /* Points of interest */
    this.POIS = []

    // todo: need to correct for different map projections.
    let crowtherData
    let myScene = this.scene
    let loader = new TextureLoader()
    let parent = this
    loader.load(
      // resource URL
      'static/textures/earthDepth_3000_1500.png',
      // onLoad callback
      function (texture) {
        crowtherData = parent.getImageData(texture.image)
        parent.drawDataEvenDistribution(myScene, crowtherData, texture.image.width, texture.image.height, 7)
      })
    this.loadGioTiff()
  }

  update () {
    TWEEN.update()
    // make sure only POIs in front of the earth are rendered
    for (let j = 0; j < this.POIS.length; j++) {
      this.POIS[ j ].update()
      this.POIS[ j ].isVisible(this._camera, this.EarthRadius)
    }
    this.controls.update()
  }

  async loadGioTiff () {
    const GeoTIFF = require('geotiff')
    let response = await fetch('static/crowther_data/Bastin_19_Restoration_Potential.tif')
    let arrayBuffer = await response.arrayBuffer()
    let tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer)
    let image = await tiff.getImage()
    let samplesPerPixel = image.getBytesPerPixel()
    let rasters = await image.readRasters()
    // const { width, height } = data
    console.log('geotiff loaded')
    console.log(image.getFileDirectory(), image.getGeoKeys())
    console.log(rasters)
    // example reading raster: http://bl.ocks.org/rveciana/263b324083ece278e966686d7dba700f
  }

  drawDataEvenDistribution (scene, imgdata, imgWidth, imgHeight, detail) {
    // todo: need to clean up this function and make it suitable for multiple datasets
    // simple method to evenly distribute points: probably more efficient ways exist
    let Octahedron = new OctahedronGeometry(this.EarthRadius, detail)
    let geometries = []
    let BaseGeometries = []
    for (let i = 0; i < Octahedron.vertices.length; i++) {
      let v = Octahedron.vertices[i]
      let horizontal = GeoUtil.cartesianToHorizontal(v.x, v.y, v.z)
      let pointValue = this.getPixelValues(imgdata, Math.round(horizontal[2] * imgWidth), Math.round((1 - horizontal[3]) * imgHeight))
      if (pointValue >= 10) {
        let startLine = GeoUtil.horizontalToCartesian(horizontal[0], horizontal[1], this.EarthRadius)
        let endLine = GeoUtil.horizontalToCartesian(horizontal[0], horizontal[1], this.EarthRadius + (pointValue / 20))
        let dataPoint = new DataPoint(startLine, endLine)
        geometries.push(dataPoint.geometry)
        // an "blank" geometry for animating into the off state
        startLine = GeoUtil.horizontalToCartesian(horizontal[0], horizontal[1], this.EarthRadius - 2)
        endLine = GeoUtil.horizontalToCartesian(horizontal[0], horizontal[1], this.EarthRadius)
        let dataPointBase = new DataPoint(startLine, endLine)
        BaseGeometries.push(dataPointBase.geometry)
      }
    }

    let dataGeometry = BufferGeometryUtils.mergeBufferGeometries(
      geometries, false)

    let baseGeometry = BufferGeometryUtils.mergeBufferGeometries(
      BaseGeometries, false)

    dataGeometry.morphAttributes.position = []
    let attributes = dataGeometry.getAttribute('position')
    attributes.name = 'empty'
    dataGeometry.morphAttributes.position[0] = attributes
    let attributes2 = baseGeometry.getAttribute('position')
    attributes2.name = 'data1'
    dataGeometry.morphAttributes.position[1] = attributes2
    const material = new MeshBasicMaterial({ vertexColors: VertexColors, morphTargets: true })
    this.mesh = new Mesh(dataGeometry, material)
    this.scene.add(this.mesh)
    let targets = []
    targets[0] = 0.0
    targets[1] = 1.0
    this.mesh.morphTargetInfluences = targets
    this.mesh.visible = false
  }

  showData (bool) {
    console.log(this.mesh)
    let targets = []
    if (bool) {
      this.mesh.visible = true
      targets[0] = 1.0
      targets[1] = 0.0
      let tween = new TWEEN.Tween(this.mesh.morphTargetInfluences).to(targets, 1000).start()
      tween.easing(TWEEN.Easing.Circular.InOut)
    } else {
      targets[0] = 0.0
      targets[1] = 1.0
      let tween = new TWEEN.Tween(this.mesh.morphTargetInfluences).to(targets, 1000).start()
      tween.easing(TWEEN.Easing.Circular.InOut)
      tween.onStop(function () {
        this.mesh.visible = false
      }.bind(this))
    }
  }
  newPOI (lat, lon, name, content) {
    // point of interest
    let newPOI = new POI(lat, lon, this.EarthRadius, name, this.scene, content)
    this.POIS.push(newPOI)
  }

  // check this the transformation from the attractors send the text boxes far away
  animateToPoint (options) {
    let lat = options.lat || 0
    let lon = options.lon || 0
    let point = GeoUtil.horizontalToCartesian(lat, lon, this.EarthRadius)
    let camDistance = options.distance + this.EarthRadius || this._camera.position.length()
    let target = point
    // this.camera.position.copy(this.target).normalize().multiplyScalar(camDistance)
    let newPosition = target.normalize().multiplyScalar(camDistance)
    let tween = new TWEEN.Tween(this._camera.position).to(newPosition, 1000).start()
    return tween.easing(TWEEN.Easing.Circular.InOut)
  }

  getImageData (image) {
    let canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    let context = canvas.getContext('2d')
    context.drawImage(image, 0, 0)
    return context.getImageData(0, 0, image.width, image.height)
  }

  getPixelValues (imagedata, x, y) {
    // todo: need to modify to work with 32 bit image data
    let position = (x + imagedata.width * y) * 4
    let data = imagedata.data
    let total = (data[ position ] + data[ position + 1 ] + data[ position + 2 ])
    return total
  }

  onDocumentPress (event) {
    // update the mouse variable
    let x = (event.clientX / window.innerWidth) * 2 - 1
    let y = -(event.clientY / window.innerHeight) * 2 + 1
    let mouse = new Vector3(x, y, 1)
    // create a Ray with origin at the mouse position
    // and direction into the scene (camera direction)
    let vector = new Vector3(mouse.x, mouse.y, 1)

    let ray = new Raycaster()
    ray.setFromCamera(mouse, this._camera)
    // create an array containing all objects in the scene with which the ray intersects
    // calculate objects intersecting the picking ray
    let intersects = ray.intersectObjects(this.scene.children)
    for (let i = 0; i < intersects.length; i++) {
      // intersects[ i ].object.material.color.set(0xff00ff)
      for (let j = 0; j < this.POIS.length; j++) {
        if (intersects[ i ].object.name === this.POIS[ j ].name) {
          let options = { lat: this.POIS[ j ].lat, lon: this.POIS[ j ].lon }
          this.animateToPoint(options)
        }
      }
    }
  }
}
export default GlobeLayer
