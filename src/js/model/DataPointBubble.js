import {
  Color, BufferAttribute, SphereBufferGeometry, Math
} from 'three'

class DataPointBubble {
  //
  constructor (location, size) {
    this.bubbleGeometry(location, size)
  }

  update () {
  }

  bubbleGeometry (location, size) {
    this.geometry = new SphereBufferGeometry(size, 8, 8)
    this.geometry.translate(location.x, location.y, location.z)
    // compute a color
    const color = new Color()
    const hue = 0.5333
    const saturation = 0.45
    const lightness = Math.lerp(0.4, 1.0, 0.3)
    color.setHSL(hue, saturation, 0)
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

export default DataPointBubble
