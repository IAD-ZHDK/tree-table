import {
  LineBasicMaterial, Color, Vector3, ConeGeometry, MeshBasicMaterial, Mesh, Line, BufferGeometry
} from 'three'
import TWEEN from '@tweenjs/tween.js'
class DataPoint {
  //
  constructor (start, end) {
    this.start = start
    this.vector = end.clone().sub(start)
    this.color = new Color(0x228b22)
    // this.lineGeometry(startLine, endLine)
    this.coneGeometry(start, end)
  }

  update () {
  }

  lineGeometry (startLine, endLine) {
    let points = []
    points.push(startLine)
    points.push(endLine)
    let material = new LineBasicMaterial({ color: this.color, opacity: 0.8, transparent: true })
    let geometry = new BufferGeometry().setFromPoints(points)
    this.object = new Line(geometry, material)
    this.object.visible = false
  }

  coneGeometry (startLine, endLine) {
    let material = new MeshBasicMaterial({ color: this.color, opacity: 0.5, transparent: true })
    let geometry = new ConeGeometry(0.4, this.vector.length(), 4, 1)
    geometry.translate(0, this.vector.length() / 2, 0)
    this.object = new Mesh(geometry, material)
    let axis = new Vector3(0, 1, 0)
    this.object.quaternion.setFromUnitVectors(axis, this.vector.clone().normalize())
    this.object.position.copy(startLine)
    this.object.visible = false
  }

  getGeometry () {
    return this.object
  }
  visible (bool) {
    if (bool) {
      this.object.visible = bool
      this.object.scale.set(0.01, 0.01, 0.01)
      this.tween = new TWEEN.Tween(this.object.scale).to({ x: 1, y: 1, z: 1 }, 1000)
      this.tween.easing(TWEEN.Easing.Circular.Out)
      this.tween.delay(Math.abs(this.start.x + this.start.y + this.start.z) * 10)
      this.tween.start()
    } else {
      this.tween = new TWEEN.Tween(this.object.scale).to({ x: 0.01, y: 0.01, z: 0.01 }, 1000).start()
      this.tween.onComplete(function () {
        this.object.visible = bool
      }.bind(this))
    }
  }
  updateLine () {
    let positions = this.object.geometry.attributes.position.array
    let newVector = this.vector.clone().normalize().addScalar(0.9)

    if (positions[3]) {
      positions[3] += newVector.x
    }
    if (positions[4]) {
      positions[4] += newVector.y
    }
    if (positions[5]) {
      positions[5] += newVector.z
    }
  }
}

export default DataPoint
