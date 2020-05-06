import {
  Mesh,
  MeshBasicMaterial,
  OctahedronGeometry,
  Vector3, VertexColors
} from 'three'
import GeoUtil from './GeoUtil'
import DataPoint from '../model/DataPoint'
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import TWEEN from '@tweenjs/tween.js'

class DataVis {
  constructor (scene) {
    this.scene = scene
  }
  newVis (EarthRadius, imgData, imgWidth, imgHeight, detail) {
    // todo: need to clean up this function and make it suitable for multiple datasets
    // method takes pixel data from a geo image and produces and geometry based on those values on the 3D globe, with uniform distribution.
    // simple method to evenly distribute points: probably more efficient ways exist
    let Octahedron = new OctahedronGeometry(EarthRadius, detail)
    let geometries = []
    let BaseGeometries = []
    for (let i = 0; i < Octahedron.vertices.length; i++) {
      let v = Octahedron.vertices[i]
      let horizontal = GeoUtil.cartesianToHorizontal(v.x, v.y, v.z)
      let pointValue = this.getPixelValues(imgData, Math.round(horizontal[2] * imgWidth), Math.round((1 - horizontal[3]) * imgHeight))
      if (pointValue >= 10) {
        let startLine = GeoUtil.horizontalToCartesian(horizontal[0], horizontal[1], EarthRadius)
        let endLine = GeoUtil.horizontalToCartesian(horizontal[0], horizontal[1], EarthRadius + (pointValue / 20))
        let dataPoint = new DataPoint(startLine, endLine)
        geometries.push(dataPoint.geometry)
        // an "blank" geometry for animating into the off state
        startLine = GeoUtil.horizontalToCartesian(horizontal[0], horizontal[1], EarthRadius - 2)
        endLine = GeoUtil.horizontalToCartesian(horizontal[0], horizontal[1], EarthRadius)
        let dataPointBase = new DataPoint(startLine, endLine)
        BaseGeometries.push(dataPointBase.geometry)
      }
    }

    let dataGeometry = BufferGeometryUtils.mergeBufferGeometries(
      geometries, false)

    let baseGeometry = BufferGeometryUtils.mergeBufferGeometries(
      BaseGeometries, false)

    dataGeometry.morphAttributes.position = []
    let attributes = dataGeometry.getAttribute('position')
    attributes.name = 'empty'
    dataGeometry.morphAttributes.position[0] = attributes
    let attributes2 = baseGeometry.getAttribute('position')
    attributes2.name = 'data1'
    dataGeometry.morphAttributes.position[1] = attributes2
    const material = new MeshBasicMaterial({ vertexColors: VertexColors, morphTargets: true })
    this.mesh = new Mesh(dataGeometry, material)

    let targets = []
    targets[0] = 0.0
    targets[1] = 1.0
    this.mesh.morphTargetInfluences = targets
    this.mesh.visible = false
    this.scene.add(this.mesh)
  }

  getPixelValues (imagedata, x, y) {
    // todo: need to modify to work with 32 bit image data
    let position = (x + imagedata.width * y) * 4
    let data = imagedata.data
    let total = (data[ position ] + data[ position + 1 ] + data[ position + 2 ])
    return total
  }

  update () {
    TWEEN.update()
  }

  showData (bool) {
    console.log(this.mesh)
    let targets = []
    if (bool) {
      this.mesh.visible = true
      targets[0] = 1.0
      targets[1] = 0.0
      let tween = new TWEEN.Tween(this.mesh.morphTargetInfluences).to(targets, 1000).start()
      tween.easing(TWEEN.Easing.Circular.InOut)
    } else {
      targets[0] = 0.0
      targets[1] = 1.0
      let tween = new TWEEN.Tween(this.mesh.morphTargetInfluences).to(targets, 1000).start()
      tween.easing(TWEEN.Easing.Circular.InOut)
      tween.onStop(function () {
        this.mesh.visible = false
      }.bind(this))
    }
  }
}
export default DataVis
