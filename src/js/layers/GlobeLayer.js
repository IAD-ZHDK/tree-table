import BaseLayer from './BaseLayer'
import {
  SphereGeometry,
  Mesh,
  MeshBasicMaterial,
  TextureLoader,
  BackSide,
  CylinderGeometry,
  Line,
  Vector3,
  BufferGeometry,
  LineBasicMaterial,
  UVMapping,
  OctahedronGeometry
} from 'three'

class GlobeLayer extends BaseLayer {
  setup () {
    super.setup()
    // disable zoom for globe
    this.controls.enablePan = false
    this.EarthRadius = 200
    /* earth */
    const EarthTexture = new TextureLoader().load('static/textures/earthMono8k.jpg')
    let EarthGeometry = new SphereGeometry(this.EarthRadius, 32, 32)
    let EarthMaterial = new MeshBasicMaterial({ map: EarthTexture })
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
    /* dataPoint */
    /* method to evenly distribute points
    let Octahedron = new OctahedronGeometry(this.EarthRadius, 5)
    for (var i = 0; i < Octahedron.vertices.length; i++) {
      var v = Octahedron.vertices[i]
      var geometry = new SphereGeometry(2, 2, 2)
      var material = new MeshBasicMaterial({ color: 0xffff00 })
      var sphere = new Mesh(geometry, material)
      sphere.position.x = v.x
      sphere.position.y = v.y
      sphere.position.z = v.z
      this.scene.add(sphere)
    } */

    // todo: need to correct for different map projection.
    var crowtherData
    var myScene = this.scene
    var loader = new TextureLoader()
    var parent = this
    loader.load(
      // resource URL
      'static/crowther_data/Bastin_19_Restoration_Potential_Mini.jpg',
      // onLoad callback
      function (texture) {
        crowtherData = parent.getImageData(texture.image)
        parent.drawData(myScene, crowtherData, texture.image.width, texture.image.height)
      })
  }

  update () {

  }

  drawData (scene, crowtherData, width, height) {
    for (let x = 0; x < width; x++) {
      let lon = x / width
      lon -= 0.5
      lon *= 360.0
      for (let y = 0; y < height; y++) {
        let red = this.getPixel(crowtherData, x, height - y).r
        let lat = y / height
        lat -= 0.5
        lat *= 180.0
        let line = this.geoLine(lat, lon, (red / 10 + 1))
        scene.add(line)
      }
    }
  }

  geoLine (lat, lon, length) {
    let points = []
    let startLine = this.calcPosition(lat, lon, this.EarthRadius)
    let endLine = this.calcPosition(lat, lon, this.EarthRadius + length)
    points.push(new Vector3(startLine[0], startLine[1], startLine[2]))
    points.push(new Vector3(endLine[0], endLine[1], endLine[2]))
    let geometry = new BufferGeometry().setFromPoints(points)
    let material = new LineBasicMaterial({ color: 0xff00ff })
    let line = new Line(geometry, material, 5)
    return line
  }

  radians (degrees) {
    let radians = degrees * (Math.PI / 180)
    return radians
  }

  calcPosition (lat, lon, radius) {
    let phi = this.radians(90 - lat)
    let theta = this.radians(lon + 180)
    let x = -((radius) * Math.sin(phi) * Math.cos(theta))
    let z = ((radius) * Math.sin(phi) * Math.sin(theta))
    let y = ((radius) * Math.cos(phi))
    return [x, y, z]
  }

  getImageData (image) {
    let canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    let context = canvas.getContext('2d')
    context.drawImage(image, 0, 0)
    return context.getImageData(0, 0, image.width, image.height)
  }

  getPixel (imagedata, x, y) {
    let position = (x + imagedata.width * y) * 4
    let data = imagedata.data
    return { r: data[ position ], g: data[ position + 1 ], b: data[ position + 2 ], a: data[ position + 3 ] }
  }
}
export default GlobeLayer
