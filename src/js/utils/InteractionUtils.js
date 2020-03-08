Object.defineProperty(HTMLElement.prototype, 'SayHi', {
  value: function SayHi () {
    return 'Hi ' + this + '!'
  },
  writable: true,
  configurable: true
})
