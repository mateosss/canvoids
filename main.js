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

  static scale(v, k) {
    return new V(v.x * k, v.y * k)
  }

  scale(k) {
    const { x, y } = V.scale(this, k)
    ;[this.x, this.y] = [x, y]
  }

  static mul(v, k) {
    V.scale(v, k)
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
  constructor({ canvas, context, boids }, x, y) {
    this.context = context
    this.canvas = canvas
    this.boids = boids
    this.location = P(x, y)
    this.velocity = P(0.1, 0.1)
  }

  update() {
    // Go towards center of mass
    const { boids } = this
    const locationMean = P(0, 0)
    for (const boid of boids) locationMean.add(boid.location)
    locationMean.scale(1 / boids.length)
    const scaledLocMean = V.scale(V.sub(locationMean, this.location), 0.01)
    this.velocity.add(scaledLocMean)

    // DVD Bounce
    const { x, y } = this.location
    const { x: vx, y: vy } = this.velocity
    const { width } = this.canvas
    if ((x <= 0 && vx < 0) || (x >= width && vx > 0)) this.velocity.x = -vx
    if ((y <= 0 && vy < 0) || (y >= width && vy > 0)) this.velocity.y = -vy

    this.location.add(this.velocity)
  }

  render() {
    const c = this.context
    c.save()
    c.translate(this.location.x, this.location.y)
    c.fillStyle = "white"
    c.fillRect(0, 0, 4, 4)
    c.restore()
  }
}

class AttractionPoint extends Boid {
  render() {
    const c = this.context
    c.save()
    c.beginPath()
    c.translate(this.location.x, this.location.y)
    c.fillStyle = "deeppink"
    c.arc(0, 0, 4, 0, Math.PI * 2)
    c.fill()
    c.restore()
  }
}

class Game {
  constructor() {
    this.boids = []
    this.canvas = document.querySelector("#canvas")
    this.attractionPoint = null
    this.context = this.canvas.getContext("2d")
    // Initialize actors
    for (let i = 0; i < 8; i++) {
      const actor = new Boid(this, Math.floor(Math.random() * 256), 1 + i * 32)
      this.boids.push(actor)
    }
  }

  mouseDown(e) {
    const [x, y] = [e.offsetX, e.offsetY]
    this.attractionPoint = new AttractionPoint(this, x, y)
  }

  run() {
    // TODO: Use requestAnimationFrame instead of setInterval
    setInterval(() => this.update(), 1000 / 60)
    this.canvas.addEventListener("mousedown", (e) => this.mouseDown(e))
  }

  update() {
    // Clean canvas
    const c = this.context
    c.fillStyle = "black"
    c.fillRect(0, 0, this.canvas.width, this.canvas.height)

    this.attractionPoint?.render()
    for (const actor of this.boids) {
      actor.update()
      actor.render()
    }
  }
}

const game = new Game()
game.run()
