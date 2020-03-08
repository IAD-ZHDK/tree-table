import TactileDevice from '../model/TactileDevice'

const OSC = require('osc-js')

class TrackingClient {
  constructor (host = 'localhost', port = 7000) {
    // define device list
    this._devices = new Map()

    // setup osc
    this._osc = new OSC()
    this._osc.on('/tracker/add', msg => { this._onDeviceAdded(msg) })
    this._osc.on('/tracker/update', msg => { this._onUpdate(msg) })
    this._osc.on('/tracker/remove', msg => { this._onDeviceRemoved(msg) })
    this._osc.open({ host: host, port: port })
  }

  _onDeviceAdded (msg) {
    const uniqueId = this._getUniqueId(msg)

    const device = this._messageToTactileDevice(msg)
    this._devices.set(uniqueId, device)

    // add user defined fields
    device.creationTime = Date.now()
    device.smoothPosition.x = device.x
    device.smoothPosition.y = device.y
    device.smoothRotation = device.rotation
  }

  _onDeviceRemoved (msg) {
    const uniqueId = this._getUniqueId(msg)

    if (this._devices.has(uniqueId)) {
      let device = this._devices.get(uniqueId)
      device.dead = true
      this._devices.delete(uniqueId)
    }
  }

  _onUpdate (msg) {
    const uniqueId = this._getUniqueId(msg)

    if (this._devices.has(uniqueId)) {
      this._messageToTactileDevice(msg, this._devices.get(uniqueId))
    } else {
      this._onDeviceAdded(msg)
    }
  }

  _messageToTactileDevice (msg, device = new TactileDevice()) {
    device.uniqueId = this._getUniqueId(msg)
    device.identifier = msg.args[1].value
    device.x = msg.args[2].value
    device.y = msg.args[3].value
    device.rotation = msg.args[4].value
    device.intensity = msg.args[5].value

    device.updateTime = Date.now()

    return device
  }

  _getUniqueId (msg) {
    return msg.args[0].value
  }

  get devices () {
    return this._devices.values()
  }
}
export default TrackingClient
