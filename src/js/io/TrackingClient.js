const OSC = require('osc-js')

class TrackingClient {
  constructor (host = 'localhost', port = 7000) {
    // define device list
    this._devices = []

    // setup osc
    this._osc = new OSC()
    this._osc.on('/tracker/add', msg => { this._onTrackerAdded(msg) })
    this._osc.on('/tracker/update', msg => { this._onUpdate(msg) })
    this._osc.on('/tracker/remove', msg => { this._onTrackerRemoved(msg) })
    this._osc.open({ host: host, port: port })
  }

  _onTrackerAdded (msg) {
    console.log('tracker addded!')
  }

  _onTrackerRemoved (msg) {
    console.log('tracker removed!')
  }

  _onUpdate (msg) {
    console.log('update received')
  }

  get devices () {
    return this._devices
  }
}
export default TrackingClient
