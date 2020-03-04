import {
  LineBasicMaterial, Color, Vector3, ConeGeometry, MeshBasicMaterial, Mesh, Line, BufferGeometry
} from 'three'
class DataPoint {
  //
  constructor (startLine, endLine) {
    this.vector = endLine.clone().sub(startLine)
    this.color = new Color(0x228b22)
    this.lineGeometry(startLine, endLine)
    // this.coneGeometry(startLine, endLine)
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
  }
  coneGeometry (startLine, endLine) {
    let material = new MeshBasicMaterial({ color: this.color, opacity: 0.5, transparent: true })
    let geometry = new ConeGeometry(0.4, this.vector.length(), 4, 1)
    this.object = new Mesh(geometry, material)
    let axis = new Vector3(0, 1, 0)
    this.object.quaternion.setFromUnitVectors(axis, this.vector.clone().normalize())
    this.object.position.copy(startLine)
    this.object.position.add(this.vector.clone().multiplyScalar(0.5))
    // this.object.matrixAutoUpdate = false
  }

  getGeometry () {
    return this.object
  }
  visible (bool) {
    this.object.visible = bool
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
