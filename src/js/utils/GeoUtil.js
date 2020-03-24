import NumberUtil from './NumberUtil.js'
import {
  Vector3
} from 'three'

class GeoUtil {
  static easeFloat (target, value, alpha = 0.1) {
    const d = target - value
    return value + (d * alpha)
  }
  static horizontalToCartesian (lat, lon, radius) {
    // returns cartesian coordinates (relative of earth center) based of longitude and latitude
    let phi = NumberUtil.radians(90 - lat)
    let theta = NumberUtil.radians(lon + 180)
    let x = -((radius) * Math.sin(phi) * Math.cos(theta))
    let z = ((radius) * Math.sin(phi) * Math.sin(theta))
    let y = ((radius) * Math.cos(phi))
    let pos = new Vector3(x, y, z)
    return pos
  }
  static CartesianToCanvas (x, y, z, _camera) {
    let width = window.innerWidth
    let height = window.innerHeight
    let widthHalf = width / 2
    let heightHalf = height / 2
    let pos = new Vector3(x, y, z)
    pos.project(_camera)
    pos.x = (pos.x * widthHalf) + widthHalf
    pos.y = -(pos.y * heightHalf) + heightHalf
    return { x: pos.x, y: pos.y }
  }
  static cartesianToHorizontal (x, y, z) {
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
}

export default GeoUtil
