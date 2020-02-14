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
  LineBasicMaterial
} from 'three'

class GlobeLayer extends BaseLayer {
  setup () {
    super.setup()

    // disable zoom for globe
    this.controls.enableZoom = false

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
    for (let i = 0; i < 200; i++) {
      let points = []
      // sydney 33.8688° S, 151.2093° E
      let lat = -33.8688 + (Math.random() * 30)
      let lon = 151.2093 + (Math.random() * 30)
      let sydney = calcPosition(lat, lon, EarthRadius)
      let sydney2 = calcPosition(lat, lon, EarthRadius + 10 + (Math.random() * 50))
      points.push(new Vector3(sydney[0], sydney[1], sydney[2]))
      points.push(new Vector3(sydney2[0], sydney2[1], sydney2[2]))
      let geometry = new BufferGeometry().setFromPoints(points)
      let material = new LineBasicMaterial({ color: 0xff00ff })
      let data = new Line(geometry, material, 5)
      this.scene.add(data)
    }
  }

  update () {

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

export default GlobeLayer
