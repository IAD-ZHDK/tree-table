import {
  SpriteMaterial,
  Sprite, TextureLoader, Color, Vector3, BufferGeometry, LineBasicMaterial, Line, Vector2, LineDashedMaterial
} from 'three'
import GeoUtil from '../utils/GeoUtil'

class POI {
  constructor (lat, lon, EarthRadius, name, scene, content) {
    const texture = new TextureLoader().load('static/textures/POI.png' + '')
    this.material = new SpriteMaterial({ map: texture, fog: false, rotation: Math.PI / 4 })
    this.name = name
    this.content = content
    this.visibility = false
    this.lat = lat
    this.lon = lon
    this.position = GeoUtil.horizontalToCartesian(lat, lon, EarthRadius)
    // Sprite
    this.sprite = new Sprite(this.material)
    this.sprite.position.x = this.position.x
    this.sprite.position.y = this.position.y
    this.sprite.position.z = this.position.z
    this.sprite.scale.set(3, 3, 1)
    this.sprite.name = name
    scene.add(this.sprite)
    this.timer = 0
  }

  update () {
    this.timer += 3
    let color = 0.4 * (Math.sin(this.radians(this.timer)))
    color += 0.6
    this.material.opacity = color
  }

  connectionLine (x, y, z) {
    let points = []
    points.push(new Vector3(x, y, z))
    points.push(new Vector3(x, y, z + 500))
    let geometry = new BufferGeometry().setFromPoints(points)
    let line = new Line(geometry, new LineDashedMaterial({ color: 0xffffff, dashSize: 2, gapSize: 1 }))
    line.computeLineDistances()
    return line
  }

  isVisible (camera, earthRadius) {
    let cameraToEarth = camera.position.length()
    let cameraToPOI = camera.position.clone().sub(this.position)
    // check if distance is greater than camera to earth tangent edge.
    let L = Math.sqrt(Math.pow(cameraToEarth, 2) - Math.pow(earthRadius, 2))
    if (cameraToPOI.length() > L) {
      this.material.depthWrite = true
      this.material.depthTest = true
      this.visibility = false
      return false
    } else {
      this.material.depthWrite = false
      this.material.depthTest = false
      this.visibility = true
      return true
    }
  }
  radians (degrees) {
    let radians = degrees * (Math.PI / 180)
    return radians
  }
}

export default POI
