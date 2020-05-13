import {
  Mesh, MeshBasicMaterial, OctahedronGeometry, TextureLoader, Vector3, VertexColors
} from 'three'
import GeoUtil from './GeoUtil'
import DataPointCone from '../model/DataPointCone'
import DataPointBubble from '../model/DataPointBubble'
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import TWEEN from '@tweenjs/tween.js'
import NumberUtil from './NumberUtil.js'

class DataVis {
  constructor (scene, EarthRadius, filePath, style = 'bubble') {
    let loader = new TextureLoader()
    this.EarthRadius = EarthRadius
    this.scene = scene
    this.style = style
    let parent = this
    if (this.isTiff(filePath)) {
      let GIOTiff = this.loadGioTiff.bind(this)
      GIOTiff(filePath, this.newVis)
    } else {
      // todo: curently there is a bug in getImageData method for regular images instead of geotiff
      loader.load(
        // resource URL
        filePath,
        // onLoad callback
        function (texture) {
          let geoData = parent.getImageData(texture.image)
          parent.newVis(geoData, texture.image.width, texture.image.height)
        })
    }
  }

  newVis (imgData, imgWidth, imgHeight) {
    let geometries
    if (this.style === 'bubble') {
      geometries = this.bubbleGeometry(imgData, imgWidth, imgHeight)
    } else {
      geometries = this.coneGeometry(imgData, imgWidth, imgHeight)
    }
    const [Geometries, BaseGeometries] = geometries

    let dataGeometry = BufferGeometryUtils.mergeBufferGeometries(
      Geometries, false)

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

  bubbleGeometry (data, imgWidth, imgHeight) {
    // a representation of pixel values into 3D spheres distributed on globe
    let Geometries = []
    let BaseGeometries = []
    let bubleLocation = []
    for (let i = 0; i < imgWidth * imgHeight; i++) {
      if (data[i] > 0.01) {
        var indexedData = [i, data[i]]
        bubleLocation.push(indexedData)
      }
    }
    for (let i = 0; i < bubleLocation.length; i++) {
      let index = bubleLocation[i][0]
      let size = bubleLocation[i][1]
      let u = (index % imgWidth) / imgWidth
      let v = 1 - Math.floor(index / imgWidth) / imgHeight
      let lat = -90 + (v * 180)
      let lon = -180 + (u * 360)
      let location = GeoUtil.horizontalToCartesian(lat, lon, this.EarthRadius)
      let dataPoint = new DataPointBubble(location, size)
      Geometries.push(dataPoint.geometry)
      // an "blank" geometry for animating into the off state
      let location2 = location.clone()
      location2.multiplyScalar(0.90)
      let dataPointBase = new DataPointBubble(location2, 1)
      BaseGeometries.push(dataPointBase.geometry)
    }
    return [Geometries, BaseGeometries]
  }

  coneGeometry (data, imgWidth, imgHeight) {
    // a representation of pixel values into 3D spikes distributed on globe
    // approach takes pixel data from a geo image and produces and geometry based on those values on the 3D globe, with uniform distribution.
    // simple method to evenly distribute points using Octohedron: probably more efficient ways exist
    let Octahedron = new OctahedronGeometry(this.EarthRadius, 7)
    let Geometries = []
    let BaseGeometries = []
    for (let i = 0; i < Octahedron.vertices.length; i++) {
      let v = Octahedron.vertices[i]
      let horizontal = GeoUtil.cartesianToHorizontal(v.x, v.y, v.z)
      let x = Math.round(horizontal[2] * imgWidth)
      let y = Math.round((1 - horizontal[3]) * imgHeight)
      let index = x + imgWidth * y
      let pointValue = data[index]
      if (pointValue > 0) {
        pointValue = pointValue * 8
        let startLine = GeoUtil.horizontalToCartesian(horizontal[0], horizontal[1], this.EarthRadius)
        let endLine = GeoUtil.horizontalToCartesian(horizontal[0], horizontal[1], this.EarthRadius + (pointValue / 20))
        let dataPoint = new DataPointCone(startLine, endLine)
        Geometries.push(dataPoint.geometry)
        // an "blank" geometry for animating into the off state
        startLine = GeoUtil.horizontalToCartesian(horizontal[0], horizontal[1], this.EarthRadius - 2)
        endLine = GeoUtil.horizontalToCartesian(horizontal[0], horizontal[1], this.EarthRadius)
        let dataPointBase = new DataPointCone(startLine, endLine)
        BaseGeometries.push(dataPointBase.geometry)
      }
    }
    return [Geometries, BaseGeometries]
  }

  getImageData (image) {
    let canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    let context = canvas.getContext('2d')
    context.drawImage(image, 0, 0)
    let imageData = context.getImageData(0, 0, image.width, image.height)
    let data = new Array(imageData.width)
    for (let i = 0; i < imageData.width; i++) {
      let row = new Array(imageData.height)
      for (let j = 0; j < imageData.height; j++) {
        let position = (i + imageData.width * j) * 4
        let total = (imageData[ position ] + imageData[ position + 1 ] + imageData[ imageData + 2 ] + imageData[ imageData + 3 ])
        let normalised = total / 4
        row[j] = total
      }
      data[i] = row
    }
    return data
  }

  getPixelValues (imageData, x, y) {
    let position = (x + imageData.width * y) * 4
    let total = (imageData.data[ position ] + imageData.data[ position + 1 ] + imageData.data[ imageData + 2 ])
    let normalised = total / (256 * 3)
    return total
  }

  isTiff (filePath) {
    let allowedExtension = ['tif']
    let fileExtension = filePath.split('.').pop().toLowerCase()
    let isValidFile = false

    for (let index in allowedExtension) {
      if (fileExtension === allowedExtension[index]) {
        isValidFile = true
        break
      }
    }
    if (!isValidFile) {
      console.log('Allowed Extensions are : *.' + allowedExtension.join(', *.'))
    }
    return isValidFile
  }

  async loadGioTiff (filePath, callback) {
    // todo: geotiff sources need to be check to see what bands have the correct data, currently just using 1st band
    const GeoTIFF = require('geotiff')
    let response = await fetch(filePath)
    let arrayBuffer = await response.arrayBuffer().catch((err) => { console.error(err) })
    let tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer).catch((err) => { console.error(err) })
    let image = await tiff.getImage().catch((err) => { console.error(err) })
    // let samplesPerPixel = image.getBytesPerPixel()
    let callbacks = callback.bind(this)
    await image.readRasters()
      .then((response) => callbacks(response[0], response.width, response.height))
      .catch((err) => { console.error(err) })
  }

  showData (bool) {
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
