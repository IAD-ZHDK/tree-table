import BaseLayer from './BaseLayer'
import POI from '../model/POI.js'
import DataPoint from '../model/DataPoint.js'
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
  Raycaster
} from 'three'
import TWEEN from '@tweenjs/tween.js'

class GlobeLayer extends BaseLayer {
  setup () {
    super.setup()
    this.EarthRadius = 100
    /* controls */
    // disable zoom for globe
    this.controls.enablePan = false
    this.controls.minDistance = this.EarthRadius + 30
    this.controls.maxDistance = this.EarthRadius * 3.5
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.01
    this.controls.zoomSpeed = 0.3
    this.matrix = new Matrix4() // matrix for camera movement

    // todo: ask florian if there is a better way to pass scope to event function
    // todo: check what events are appropriate on table
    let context = this
    window.addEventListener('mousedown', function (event) {
      this.onDocumentPress(event)
    }.bind(this), false)
    window.addEventListener('ontouchstart', function (event) {
      this.onDocumentPress(event)
    }.bind(this), false)

    /* earth */
    const EarthTexture = new TextureLoader().load('static/textures/earthMono_16384_8192.jpg' +
      '')
    let EarthGeometry = new SphereGeometry(this.EarthRadius, 100, 100)
    let EarthMaterial = new MeshPhongMaterial({ map: EarthTexture })
    // bump map
    // EarthMaterial.bumpMap = new TextureLoader().load('static/textures/gebco_08_rev_elev.png' +
    //  '')
    // specular reflection
    EarthMaterial.specularMap = new TextureLoader().load('static/textures/earthSpec_512_256.jpg' +
      '')
    EarthMaterial.shininess = 100
    // EarthMaterial.bumpScale = 20
    this.Earth = new Mesh(EarthGeometry, EarthMaterial)
    this.Earth.position.x = 0
    this.scene.add(this.Earth)

    /* stars */
    const StarTexture = new TextureLoader().load('static/textures/sky.jpg')
    let StarGeometry = new SphereGeometry(1200, 10, 10)
    let StarMaterial = new MeshBasicMaterial({ side: BackSide, map: StarTexture })
    this.Star = new Mesh(StarGeometry, StarMaterial)
    this.Star.position.x = 0
    this.scene.add(this.Star)
    this.Star.castShadow = false

    /* lights */
    this.light = new AmbientLight(0xffffff, 0.6)
    this.scene.add(this.light)
    this.spotLight = new SpotLight(0xffffff, 0.5, 2000, 10, 2)
    this.spotLight.castShadow = true
    this.spotLight.position.set(200, 0, 100)
    this.spotLight.angle = 1.05
    this.Earth.receiveShadow = true
    this.Earth.castShadow = true
    this.scene.add(this.spotLight)

    /* Points of interest */
    this.POIS = []

    /* dataPoint */
    this.DataObjects = []

    // todo: need to correct for different map projections.
    var crowtherData
    var myScene = this.scene
    var loader = new TextureLoader()
    var parent = this
    loader.load(
      // resource URL
      'static/textures/earthDepth_3000_1500.png',
      // onLoad callback
      function (texture) {
        crowtherData = parent.getImageData(texture.image)
        parent.drawDataEvenDistribution(myScene, crowtherData, texture.image.width, texture.image.height, 6)
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
    // simple method to evenly distribute points: probably more efficient ways exist
    let Octahedron = new OctahedronGeometry(this.EarthRadius, detail)
    for (let i = 0; i < Octahedron.vertices.length; i++) {
      let v = Octahedron.vertices[i]
      let horizontal = this.cartesianToHorizontal(v.x, v.y, v.z)

      let pointValue = this.getPixelValues(imgdata, Math.round(horizontal[2] * imgWidth), Math.round((1 - horizontal[3]) * imgHeight))
      if (pointValue >= 10) {
        // let line = this.dataLine(horizontal[0], horizontal[1], (pointValue / 20))
        let startLine = this.horizontalToCartesian(horizontal[0], horizontal[1], this.EarthRadius)
        let endLine = this.horizontalToCartesian(horizontal[0], horizontal[1], this.EarthRadius + (pointValue / 10))
        let dataPoint = new DataPoint(startLine, endLine)
        this.DataObjects.push(dataPoint)
        scene.add(dataPoint.getGeometry())
        dataPoint.visible(false)
      }
    }
  }

  showData (bool) {
    for (let i = 0; i < this.DataObjects.length; i++) {
      this.DataObjects[i].visible(bool)
    }
  }

  radians (degrees) {
    let radians = degrees * (Math.PI / 180)
    return radians
  }

  newPOI (lat, lon, name) {
    // point of interest
    let location = this.horizontalToCartesian(lat, lon, this.EarthRadius)
    let newPOI = new POI(location, name, this.scene)
    this.POIS.push(newPOI)
  }

  horizontalToCartesian (lat, lon, radius) {
    // returns cartesian coordinates (relative of earth center) based of longitude and latitude
    let phi = this.radians(90 - lat)
    let theta = this.radians(lon + 180)
    let x = -((radius) * Math.sin(phi) * Math.cos(theta))
    let z = ((radius) * Math.sin(phi) * Math.sin(theta))
    let y = ((radius) * Math.cos(phi))
    let pos = new Vector3(x, y, z)
    return pos
    // return { x: x, y: y, z: z }
  }

  CartesianToCanvas (x, y, z) {
    // todo: test if this is accurate
    let width = window.innerWidth
    let height = window.innerHeight
    let widthHalf = width / 2
    let heightHalf = height / 2
    let pos = new Vector3(x, y, z)
    let pos2D = pos.clone()
    pos.project(this._camera)
    pos.x = (pos.x * widthHalf) + widthHalf
    pos.y = -(pos.y * heightHalf) + heightHalf
    return { x: pos.x, y: pos.y }
  }

  cartesianToHorizontal (x, y, z) {
    // returns longitude and latitude based on cartesian coordinates (relative of earth center)
    // ref: https://en.wikipedia.org/wiki/UV_mapping#Finding_UV_on_a_sphere
    let unitVector = new Vector3(x, y, z)
    unitVector.normalize()
    let u = 0.5 + (Math.atan2(unitVector.z, unitVector.x) / (2 * Math.PI))
    let v = 0.5 - (Math.asin(unitVector.y) / Math.PI)
    let lat = -90 + (v * 180)
    let lon = -180 + (u * 360)
    return [lat, lon, u, v]
  }

  animateToPoint (options) {
    let lat = options.lat || 0
    let lon = options.lon || 0
    let point = options.point || this.horizontalToCartesian(lat, lon, this.EarthRadius)
    let camDistance = options.distance + this.EarthRadius || this._camera.position.length()
    let target = point || this.horizontalToCartesian(lat, lon, this.EarthRadius)
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
    // find intersections

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
          let options = { point: this.POIS[ j ].position }
          this.animateToPoint(options)
        }
      }
    }
  }
}
export default GlobeLayer
