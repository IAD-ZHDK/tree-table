import { Vector2 } from 'three'
import NumberUtil from '../utils/NumberUtil'

class TactileDevice {
  constructor () {
    this._uniqueId = -1
    this._identifier = -1
    this._x = 0.0
    this._y = 0.0
    this._rotation = 0.0
    this._intensity = 0.0
    this._dead = false

    this._creationTime = 0
    this._updateTime = 0

    this._smoothPosition = new Vector2()
    this._smoothRotation = 0.0
  }

  update () {
    // updates smoothing values
    this._smoothRotation = NumberUtil.easeFloat(this._rotation, this._smoothRotation, 0.1)

    this._smoothPosition.x = NumberUtil.easeFloat(this._x, this._smoothPosition.x, 0.1)
    this._smoothPosition.y = NumberUtil.easeFloat(this._y, this._smoothPosition.y, 0.1)
  }

  get uniqueId () {
    return this._uniqueId
  }

  set uniqueId (value) {
    this._uniqueId = value
  }

  get identifier () {
    return this._identifier
  }

  set identifier (value) {
    this._identifier = value
  }

  get x () {
    return this._x
  }

  set x (value) {
    this._x = value
  }

  get y () {
    return this._y
  }

  set y (value) {
    this._y = value
  }

  get rotation () {
    return this._rotation
  }

  set rotation (value) {
    this._rotation = value
  }

  get intensity () {
    return this._intensity
  }

  set intensity (value) {
    this._intensity = value
  }

  get dead () {
    return this._dead
  }

  set dead (value) {
    this._dead = value
  }

  get creationTime () {
    return this._creationTime
  }

  set creationTime (value) {
    this._creationTime = value
  }

  get updateTime () {
    return this._updateTime
  }

  set updateTime (value) {
    this._updateTime = value
  }

  get smoothPosition () {
    return this._smoothPosition
  }

  set smoothPosition (value) {
    this._smoothPosition = value
  }

  get smoothRotation () {
    return this._smoothRotation
  }

  set smoothRotation (value) {
    this._smoothRotation = value
  }
}

export default TactileDevice
