class NumberUtil {
  static easeFloat (target, value, alpha = 0.1) {
    const d = target - value
    return value + (d * alpha)
  }

  static easeFloatCircular (target, value, maxValue, alpha = 0.1) {
    let delta = target - value
    const altDelta = maxValue - Math.abs(delta)

    if (Math.abs(altDelta) < Math.abs(delta)) {
      delta = altDelta * (delta < 0 ? 1 : -1)
    }

    return value + (delta * alpha)
  }

  static radians (degrees) {
    let radians = degrees * (Math.PI / 180)
    return radians
  }

  static map (inMin, inMax, outMin, outMax) {
    return (this - inMin) * (outMax - outMin) / (inMax - inMin) + outMin
  }
  static modFloor (size, index) {
    return ((size % index) + index) % index
  }
}

export default NumberUtil
