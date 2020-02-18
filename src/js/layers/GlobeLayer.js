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
  UVMapping
} from 'three'

class GlobeLayer extends BaseLayer {
  setup () {
    super.setup()
    // disable zoom for globe
    this.controls.enablePan = false
    let EarthRadius = 200
    /* earth */
    const EarthTexture = new TextureLoader().load('static/textures/earthMono8k.jpg')
    let EarthGeometry = new SphereGeometry(EarthRadius, 32, 32)
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
    // todo: need to correct for different map projection.
    var texture
    var crowtherData
    var myScene = this.scene
    texture = new TextureLoader().load('static/crowther_data/Bastin_19_Restoration_Potential_Mini.jpg', function (event) {
      crowtherData = getImageData(texture.image)
      drawData(myScene, crowtherData, texture.image.width, texture.image.height, EarthRadius)
    })
  }
  update () {

  }
}

function drawData (scene, crowtherData, width, height, EarthRadius) {
  for (let x = 0; x < width; x++) {
    let lon = x / width
    lon -= 0.5
    lon *= 360.0
    console.log(lon)
    for (let y = 0; y < height; y++) {
      let red = getPixel(crowtherData, x, height - y).r
      let lat = y / height
      lat -= 0.5
      lat *= 180.0
      let points = []
      let startLine = calcPosition(lat, lon, EarthRadius)
      let endLine = calcPosition(lat, lon, EarthRadius + (red / 10 + 1))
      points.push(new Vector3(startLine[0], startLine[1], startLine[2]))
      points.push(new Vector3(endLine[0], endLine[1], endLine[2]))
      let geometry = new BufferGeometry().setFromPoints(points)
      let material = new LineBasicMaterial({ color: 0xff00ff })
      let data = new Line(geometry, material, 5)
      scene.add(data)
    }
  }
}

function radians (degrees) {
  let radians = degrees * (Math.PI / 180)
  return radians
}

function calcPosition (lat, lon, radius) {
  let phi = radians(90 - lat)
  let theta = radians(lon + 180)
  let x = -((radius) * Math.sin(phi) * Math.cos(theta))
  let z = ((radius) * Math.sin(phi) * Math.sin(theta))
  let y = ((radius) * Math.cos(phi))
  return [x, y, z]
}

function getImageData (image) {
  let canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  let context = canvas.getContext('2d')
  context.drawImage(image, 0, 0)
  return context.getImageData(0, 0, image.width, image.height)
}

function getPixel (imagedata, x, y) {
  let position = (x + imagedata.width * y) * 4
  let data = imagedata.data
  return { r: data[ position ], g: data[ position + 1 ], b: data[ position + 2 ], a: data[ position + 3 ] }
}

export default GlobeLayer
