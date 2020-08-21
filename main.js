// TODO: Read
// - boids http://www.red3d.com/cwr/boids/
//   - technical paper: http://www.red3d.com/cwr/papers/1987/boids.html
//   - informal paper: http://www.red3d.com/cwr/nobump/nobump.html
// - steering: http://www.red3d.com/cwr/steer/

// TODO: Implement Rule 2
// TODO: Show facing direction
// TODO: Implement Rule 3

// TODO: Remove this eslint switch
// eslint-disable-next-line max-classes-per-file
const V = class Vector {
  constructor(x, y) {
    this.x = x
    this.y = y
  }

  static add(v, w) {
    if (typeof w === "number") return new V(v.x + w, v.y + w)
    return new V(v.x + w.x, v.y + w.y)
  }

  add(w) {
    const { x, y } = V.add(this, w)
    ;[this.x, this.y] = [x, y]
  }

  static sub(v, w) {
    if (typeof w === "number") return new V(v.x - w, v.y - w)
    return new V(v.x - w.x, v.y - w.y)
  }

  sub(w) {
    const { x, y } = V.sub(this, w)
    ;[this.x, this.y] = [x, y]
  }

  static dot(v, w) {
    return v.x * w.x + v.y * w.y
  }

  dot(w) {
    const { x, y } = V.dot(this, w)
    ;[this.x, this.y] = [x, y]
  }

  static scale(v, k) {
    return new V(v.x * k, v.y * k)
  }

  scale(k) {
    const { x, y } = V.scale(this, k)
    ;[this.x, this.y] = [x, y]
  }

  static mul(v, k) {
    return V.scale(v, k)
  }

  mul(k) {
    this.scale(k)
  }

  static rot(v, a, degrees = true) {
    // Rotates vector v in degrees (or radians if degrees = false)
    const radians = degrees ? a * (Math.PI / 180) : a
    const [sina, cosa] = [Math.sin(radians), Math.cos(radians)]
    return new V(cosa * v.x - sina * v.y, sina * v.x + cosa * v.y)
  }

  rot(a) {
    const { x, y } = V.rot(this, a)
    ;[this.x, this.y] = [x, y]
  }

  static angleBetween(from, to) {
    const dot = V.dot(from, to)
    const det = from.x * to.y + from.y + to.x
    return Math.atan2(det, dot)
  }

  angleTo(to) {
    return V.angleBetween(this, to)
  }

  get angle() {
    return this.angleTo(new V(1, 0))
  }

  copy() {
    return new V(this.x, this.y)
  }

  get magnitude() {
    return Math.sqrt(this.x ** 2 + this.y ** 2)
  }

  get normalized() {
    return V.scale(this.copy(), 1 / this.magnitude)
  }

  static get zero() {
    return new V(0, 0)
  }

  toString() {
    return `(${this.x}, ${this.y})`
  }
}
const P = (x, y) => new V(x, y) // Short Vector (Point) construction

// TODO: Remove this eslint switch
// eslint-disable-next-line max-classes-per-file
class Boid {
  constructor({ canvas, context, boids }, x, y, radius = 16) {
    this.context = context
    this.canvas = canvas
    this.boids = boids
    this.location = P(x, y)
    this.velocity = P(1, 0)
    this.radius = radius
  }

  update() {
    // Go towards center of mass
    const LOCATION_MEAN_RATIO = 0.01
    const { boids } = this
    const locationMean = P(0, 0)
    for (const boid of boids) locationMean.add(boid.location)
    locationMean.scale(1 / boids.length)
    const scaledLocMean = V.scale(
      V.sub(locationMean, this.location),
      LOCATION_MEAN_RATIO
    )
    this.velocity.add(scaledLocMean)

    // Repel other boids
    const repulsion = P(0, 0)
    for (const boid of boids) {
      const stretch = V.sub(boid.location, this.location)
      if (boid !== this && stretch.magnitude < this.radius) {
        repulsion.add(stretch)
      }
    }
    const REPULSION_RATIO = 1
    repulsion.scale(-REPULSION_RATIO)
    this.velocity.add(repulsion)

    // Align with others
    const alignment = P(0, 0)
    for (const boid of boids) {
      if (boid !== this) {
        alignment.add(boid.velocity)
      }
    }
    alignment.scale(1 / (boids.length - 1))
    alignment.sub(this.velocity) // Make relative to current velocity
    alignment.scale(1 / 8) // Use a ratio of it
    this.velocity.add(alignment)

    // DVD Bounce
    const { x, y } = this.location
    const { x: vx, y: vy } = this.velocity
    const { width } = this.canvas
    if ((x <= 0 && vx < 0) || (x >= width && vx > 0)) this.velocity.x = -vx
    if ((y <= 0 && vy < 0) || (y >= width && vy > 0)) this.velocity.y = -vy

    // Limit velocity
    const MAX_VELOCITY = 8
    if (this.velocity.magnitude > MAX_VELOCITY)
      this.velocity = V.mul(this.velocity.normalized, MAX_VELOCITY)

    this.location.add(this.velocity)
  }

  render() {
    const c = this.context
    c.save()
    c.translate(this.location.x, this.location.y)
    c.fillStyle = "white"
    c.beginPath()
    c.rotate(this.velocity.angle)
    c.moveTo(0, this.radius / 3)
    c.lineTo(this.radius, 0)
    c.lineTo(0, -this.radius / 3)
    c.closePath()
    c.fill()
    c.restore()
  }
}

class AttractionPoint extends Boid {
  render() {
    const c = this.context
    c.save()
    c.beginPath()
    c.translate(this.location.x, this.location.y)
    c.fillStyle = "#E91E63"
    c.arc(0, 0, 4, 0, Math.PI * 2)
    c.fill()
    c.restore()
  }
}

class Game {
  constructor() {
    this.boids = []
    this.canvas = document.querySelector("#canvas")
    this.context = this.canvas.getContext("2d")
    this.attractionPointIndex = null
    // Initialize actors
    const ACTOR_COUNT = 64
    const { width } = this.canvas
    const chunk = width / ACTOR_COUNT
    for (let i = 0; i < ACTOR_COUNT; i++) {
      const actor = new Boid(this, Math.floor(Math.random() * width), chunk * i)
      this.boids.push(actor)
    }
  }

  get attractionPoint() {
    return this.attractionPointIndex in this.boids
      ? this.boids[this.attractionPointIndex]
      : null
  }

  disperse() {
    for (const boid of this.boids) {
      boid.location.add(V.mul(boid.velocity, -50))
    }
  }

  mouseDown(e) {
    // Map viewport to canvas coordinates
    if (e.button !== 0) {
      this.disperse()
    } else {
      const [x, y] = [e.offsetX, e.offsetY]
      const vw = this.canvas.getBoundingClientRect().width
      const cw = this.canvas.width
      const ap = new AttractionPoint(this, (x / vw) * cw, (y / vw) * cw)
      this.attractionPointIndex = this.boids.push(ap)
    }
  }

  fillScreen(color) {
    const c = this.context
    c.fillStyle = color
    c.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  run() {
    // TODO: Use requestAnimationFrame instead of setInterval
    setInterval(() => this.update(), 1000 / 60)
    this.canvas.addEventListener("mousedown", (e) => this.mouseDown(e))
    this.fillScreen("white")
  }

  update() {
    // Clean canvas
    this.fillScreen("rgba(0, 0, 0, 0.005)")
    for (const actor of this.boids) {
      actor.update()
      actor.render()
    }
  }
}

const game = new Game()
game.run()
