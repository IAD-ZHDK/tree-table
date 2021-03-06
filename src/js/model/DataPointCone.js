import {
  Color, Vector3, Object3D, BufferAttribute, ConeBufferGeometry, Math
} from 'three'

class DataPointCone {
  //
  constructor (start, end) {
    const vector = end.clone().sub(start)
    // this.lineGeometry(startLine, endLine)
    this.coneGeometry(start, vector)
  }

  update () {
  }

  coneGeometry (startLine, vector) {
    let originHelper = new Object3D()
    this.geometry = new ConeBufferGeometry(0.4, vector.length(), 4, 1)
    this.geometry.translate(0, vector.length() / 2, 0)
    let axis = new Vector3(0, 1, 0)
    originHelper.quaternion.setFromUnitVectors(axis, vector.clone().normalize())
    originHelper.position.copy(startLine)
    originHelper.updateWorldMatrix(true, false)
    this.geometry.applyMatrix(originHelper.matrixWorld)

    // compute a color
    let amount = vector.length() / 100
    const color = new Color()
    const hue = 0.5333
    const saturation = 0.45
    const lightness = Math.lerp(0.4, 1.0, amount)
    color.setHSL(hue, saturation, lightness)
    // get the colors as an array of values from 0 to 255
    const rgb = color.toArray().map(v => v * 255)
    // make an array to store colors for each vertex
    const numVerts = this.geometry.getAttribute('position').count
    const itemSize = 3 // r, g, b
    const colors = new Uint8Array(itemSize * numVerts)
    // copy the color into the colors array for each vertex
    colors.forEach((v, ndx) => {
      colors[ndx] = rgb[ndx % 3]
    })

    const normalized = true
    const colorAttrib = new BufferAttribute(colors, itemSize, normalized)
    this.geometry.setAttribute('color', colorAttrib)
  }

  getGeometry () {
    return this.geometry
  }
}

export default DataPointCone
