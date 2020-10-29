/*
Custom 2d vector class with support for on-instance and declarative calls
Inspirted from Unity's Vector2 and Vector3 classes
https://docs.unity3d.com/ScriptReference/Vector2.html

Usage:
const v = new Vector(1, 0)
const w = new Vector(1, 3)
const sum = V.add(v, w) // -> (2, 3), v and w are intact
// Or maybe you just want to reuse v, then
v.add(w) // This modifies v, so now v.x === 2 and v.y === 3

*/
export default class Vector {
  constructor(x, y) {
    this.x = x
    this.y = y
  }

  static add(v, w) {
    // Adds vectors v and w, or vector v and scalar w
    if (typeof w === "number") return new Vector(v.x + w, v.y + w)
    return new Vector(v.x + w.x, v.y + w.y)
  }

  add(w) {
    const { x, y } = Vector.add(this, w)
    ;[this.x, this.y] = [x, y]
  }

  static sub(v, w) {
    // Same as add() but with substraction
    if (typeof w === "number") return new Vector(v.x - w, v.y - w)
    return new Vector(v.x - w.x, v.y - w.y)
  }

  sub(w) {
    const { x, y } = Vector.sub(this, w)
    ;[this.x, this.y] = [x, y]
  }

  static dot(v, w) {
    // Dot product between vectors v and w
    return v.x * w.x + v.y * w.y
  }

  dot(w) {
    const { x, y } = Vector.dot(this, w)
    ;[this.x, this.y] = [x, y]
  }

  static scale(v, k) {
    // Multiplies each coordinate of vector v by scalar k
    return new Vector(v.x * k, v.y * k)
  }

  scale(k) {
    const { x, y } = Vector.scale(this, k)
    ;[this.x, this.y] = [x, y]
  }

  static mul(v, k) {
    // Same as scale()
    return Vector.scale(v, k)
  }

  mul(k) {
    this.scale(k)
  }

  static rot(v, a, degrees = true) {
    // Rotates vector v in a degrees (or radians if degrees = false)
    const radians = degrees ? a * (Math.PI / 180) : a
    const [sina, cosa] = [Math.sin(radians), Math.cos(radians)]
    return new Vector(cosa * v.x - sina * v.y, sina * v.x + cosa * v.y)
  }

  rot(a) {
    const { x, y } = Vector.rot(this, a)
    ;[this.x, this.y] = [x, y]
  }

  static angleBetween(from, to) {
    // Returns the angle between from and to vectors
    const dot = Vector.dot(from, to)
    const det = from.x * to.y + from.y + to.x
    return Math.atan2(det, dot)
  }

  angleTo(to) {
    return Vector.angleBetween(this, to)
  }

  get angle() {
    // Returns the angle of this vector from the x axis
    return this.angleTo(new Vector(1, 0))
  }

  static clampedMagnitude(v, limit) {
    // Returns a copy of vector v with its magnitude clamped to limit
    return v.magnitude > limit ? Vector.mul(v.normalized, limit) : v
  }

  clampedTo(limit) {
    return Vector.clampedMagnitude(this, limit)
  }

  clamp(limit) {
    const { x, y } = Vector.clampedMagnitude(this, limit)
    ;[this.x, this.y] = [x, y]
  }

  copy() {
    // Returns a copy of this vector
    return new Vector(this.x, this.y)
  }

  get magnitude() {
    // Returns the length of this vector
    return Math.sqrt(this.x ** 2 + this.y ** 2)
  }

  get normalized() {
    // Returns a copy of this vector with unit length
    return Vector.scale(this.copy(), 1 / this.magnitude)
  }

  static get zero() {
    // Returns the zero vector
    return new Vector(0, 0)
  }

  toString() {
    return `(${this.x}, ${this.y})`
  }
}
