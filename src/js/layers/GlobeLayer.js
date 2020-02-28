import BaseLayer from './BaseLayer'
import {
  SphereGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  TextureLoader,
  BackSide,
  Line,
  Vector3,
  BufferGeometry,
  LineBasicMaterial,
  OctahedronGeometry,
  SpotLight,
  AmbientLight,
  Matrix4,
  Clock,
  Raycaster,
  Vector2,
  AxesHelper, Frustum
} from 'three'
import TWEEN from '@tweenjs/tween.js'

class GlobeLayer extends BaseLayer {
  setup () {
    super.setup()
    this.EarthRadius = 100
    /* controls */
    // disable zoom for globe
    this.controls.enablePan = false
    this.controls.minDistance = this.EarthRadius + 10
    this.controls.maxDistance = this.EarthRadius * 3.5
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.01
    this.controls.zoomSpeed = 0.3
    this.matrix = new Matrix4() // matrix for camera movement
    this.raycaster = new Raycaster()
    this.mouse = new Vector2()
    let context = this
    window.addEventListener('mousemove', function (event) {
      context.onMouseMove(event, context)
    }, false)
    // window.addEventListener('touchstart', this.onMouseMove, false)

    /* earth */
    const EarthTexture = new TextureLoader().load('static/textures/earthMono10K.jpg' +
      '')
    let EarthGeometry = new SphereGeometry(this.EarthRadius, 100, 100)
    let EarthMaterial = new MeshPhongMaterial({ map: EarthTexture })
    // bump map
    // EarthMaterial.bumpMap = new TextureLoader().load('static/textures/gebco_08_rev_elev.png' +
    //  '')
    // specular reflection
    EarthMaterial.specularMap = new TextureLoader().load('static/textures/earthspec1k.jpg' +
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
    this.target = this.horizontalToCartesian(-37.8136, 144.9631, this.EarthRadius)

    /* dataPoint */
    this.DataObjects = []
    // todo: need to correct for different map projection.
    // todo: move to geodetic system rather than sphere
    var crowtherData
    var myScene = this.scene
    var loader = new TextureLoader()
    var parent = this
    loader.load(
      // resource URL
      'static/textures/gebco_08_rev_elev.png',
      // onLoad callback
      function (texture) {
        crowtherData = parent.getImageData(texture.image)
        // parent.drawData(myScene, crowtherData, texture.image.width, texture.image.height)
        parent.drawDataEvenDistribution(myScene, crowtherData, texture.image.width, texture.image.height, 6)
      })
    this.loadGioTiff()
  }

  update () {
    if (this.animateFlag === true) {
      // let point = this.target
      // let camDistance = this._camera.position.length()
      // this.camera.position.copy(point).normalize().multiplyScalar(camDistance)
      this.animateFlag = false
    }
    TWEEN.update()
    this.racasting()
    /* todo: check if POIS visible */

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

      let pointValue = this.getPixelvalues(imgdata, Math.round(horizontal[2] * imgWidth), Math.round((1 - horizontal[3]) * imgHeight))
      if (pointValue >= 10) {
        let line = this.dataLine(horizontal[0], horizontal[1], (pointValue / 20))
        line.visible = false
        this.DataObjects.push(line)
        scene.add(line)
      }
      // let line = this.line(v.x, v.y, v.z)
      /*  var geometry = new SphereGeometry(2, 2, 2)
      var material = new MeshBasicMaterial({ color: 0xffff00 })
      var sphere = new Mesh(geometry, material)
      sphere.position.x = v.x
      sphere.position.y = v.y
      sphere.position.z = v.z
      this.scene.add(sphere) */
    }
  }

  dataVisible (bool) {
    for (let i = 0; i < this.DataObjects.length; i++) {
      this.DataObjects[i].visible = bool
    }
  }
  drawData (scene, imgdata, width, height) {
    // draw a 3D visualization of image data
    // this method distributes data-points evenly across map texture, causing uneven distribution on 3D projection
    for (let x = 0; x < width; x++) {
      let lon = x / width
      lon -= 0.5
      lon *= 360.0
      for (let y = 0; y < height; y++) {
        let red = this.getPixelvalues(imgdata, x, height - y).r
        let lat = y / height
        lat -= 0.5
        lat *= 180.0
        let line = this.dataLine(lat, lon, (red / 10 + 1))
        this.DataObjects.push(line)
        scene.add(line)
      }
    }
  }

  dataLine (lat, lon, length) {
    let points = []
    let startLine = this.horizontalToCartesian(lat, lon, this.EarthRadius)
    let endLine = this.horizontalToCartesian(lat, lon, this.EarthRadius + length)
    points.push(startLine)
    points.push(endLine)
    let geometry = new BufferGeometry().setFromPoints(points)
    let material = new LineBasicMaterial({ color: 0xff00ff })
    let line = new Line(geometry, material, 5)
    return line
  }

  line (x, y, z) {
    let points = []
    points.push(new Vector3(x, y, z))
    points.push(new Vector3(x, y, z + 200))
    let geometry = new BufferGeometry().setFromPoints(points)
    let material = new LineBasicMaterial({ color: 0xff00ff })
    let line = new Line(geometry, material, 5)
    return line
  }

  radians (degrees) {
    let radians = degrees * (Math.PI / 180)
    return radians
  }

  newPOI (lat, lon, name) {
    // point of interest
    let location = this.horizontalToCartesian(lat, lon, this.EarthRadius)

    let geometry = new SphereGeometry(1, 6, 6)
    let material = new MeshBasicMaterial({ color: 0x00ffff })
    let point = new Mesh(geometry, material)
    point.position.x = location.x
    point.position.y = location.y
    point.position.z = location.z
    this.POIS.push(point)
    this.scene.add(point)
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
    // todo: teste if this is accurate
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

  animateToPoint (lat, lon) {
    this.animateFlag = true
    this.target.copy(this.horizontalToCartesian(lat, lon, this.EarthRadius))
    let camDistance = this._camera.position.length()
    // this.camera.position.copy(target).normalize().multiplyScalar(camDistance)
    let newPosition = this.target.normalize().multiplyScalar(camDistance)
    let tween = new TWEEN.Tween(this._camera.position).to(this.target, 1000).start()
    tween.easing(TWEEN.Easing.Exponential.InOut)
  }

  getImageData (image) {
    let canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    let context = canvas.getContext('2d')
    context.drawImage(image, 0, 0)
    return context.getImageData(0, 0, image.width, image.height)
  }

  getPixelvalues (imagedata, x, y) {
    // todo: need to modify to work with 32 bit image data
    let position = (x + imagedata.width * y) * 4
    let data = imagedata.data
    let total = (data[ position ] + data[ position + 1 ] + data[ position + 2 ])
    // let alpha = data[ position + 3 ]
    return total
    // return alpha
    // return { r: data[ position ], g: data[ position + 1 ], b: data[ position + 2 ], a: data[ position + 3 ] }
  }
  onMouseMove (event, context) {
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    context.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    context.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
  }
  racasting () {
    // update the picking ray with the camera and mouse position
    this.raycaster.setFromCamera(this.mouse, this._camera)

    // calculate objects intersecting the picking ray
    var intersects = this.raycaster.intersectObjects(this.scene.children)

    for (var i = 0; i < intersects.length; i++) {
      // intersects[ i ].object.material.color.set(0xff0000)
    }
  }
}
export default GlobeLayer
