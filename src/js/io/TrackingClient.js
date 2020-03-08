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

    const device = this._messageToTactileDevice(msg, new TactileDevice())
    this._devices.set(uniqueId, device)

    // add user defined fields
    device.creationTime = Date.now()
    device.smoothPosition.x = device.x
    device.smoothPosition.y = device.y
    device.smoothRotation = device.rotation

    console.log(`added device with id ${uniqueId}`)
  }

  _onDeviceRemoved (msg) {
    const uniqueId = this._getUniqueId(msg)

    if (this._devices.has(uniqueId)) {
      let device = this._devices.get(uniqueId)
      device.dead = true
      this._devices.delete(uniqueId)

      console.log(`removed device with id ${uniqueId}`)
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

  _messageToTactileDevice (msg, device) {
    device.uniqueId = this._getUniqueId(msg)
    device.identifier = msg.args[1]
    device.x = msg.args[2]
    device.y = msg.args[3]
    device.rotation = msg.args[4]
    device.intensity = msg.args[5]

    device.updateTime = Date.now()

    return device
  }

  _getUniqueId (msg) {
    return msg.args[0]
  }

  get devices () {
    return Array.from(this._devices.values())
  }
}
export default TrackingClient
