export default class Vector {
  constructor(x, y) {
    this.x = x
    this.y = y
  }

  static add(v, w) {
    if (typeof w === "number") return new Vector(v.x + w, v.y + w)
    return new Vector(v.x + w.x, v.y + w.y)
  }

  add(w) {
    const { x, y } = Vector.add(this, w)
    ;[this.x, this.y] = [x, y]
  }

  static sub(v, w) {
    if (typeof w === "number") return new Vector(v.x - w, v.y - w)
    return new Vector(v.x - w.x, v.y - w.y)
  }

  sub(w) {
    const { x, y } = Vector.sub(this, w)
    ;[this.x, this.y] = [x, y]
  }

  static dot(v, w) {
    return v.x * w.x + v.y * w.y
  }

  dot(w) {
    const { x, y } = Vector.dot(this, w)
    ;[this.x, this.y] = [x, y]
  }

  static scale(v, k) {
    return new Vector(v.x * k, v.y * k)
  }

  scale(k) {
    const { x, y } = Vector.scale(this, k)
    ;[this.x, this.y] = [x, y]
  }

  static mul(v, k) {
    return Vector.scale(v, k)
  }

  mul(k) {
    this.scale(k)
  }

  static rot(v, a, degrees = true) {
    // Rotates vector v in degrees (or radians if degrees = false)
    const radians = degrees ? a * (Math.PI / 180) : a
    const [sina, cosa] = [Math.sin(radians), Math.cos(radians)]
    return new Vector(cosa * v.x - sina * v.y, sina * v.x + cosa * v.y)
  }

  rot(a) {
    const { x, y } = Vector.rot(this, a)
    ;[this.x, this.y] = [x, y]
  }

  static angleBetween(from, to) {
    const dot = Vector.dot(from, to)
    const det = from.x * to.y + from.y + to.x
    return Math.atan2(det, dot)
  }

  angleTo(to) {
    return Vector.angleBetween(this, to)
  }

  get angle() {
    return this.angleTo(new Vector(1, 0))
  }

  copy() {
    return new Vector(this.x, this.y)
  }

  get magnitude() {
    return Math.sqrt(this.x ** 2 + this.y ** 2)
  }

  get normalized() {
    return Vector.scale(this.copy(), 1 / this.magnitude)
  }

  static get zero() {
    return new Vector(0, 0)
  }

  toString() {
    return `(${this.x}, ${this.y})`
  }
}
