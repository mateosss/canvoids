/*
  Boids are bird-like objects (bird-oids), it is a term coined by Craig Reynolds

  This implementation was made after reading these brief pages:
  - https://eater.net/boids
  - http://www.kfish.org/boids/pseudocode.html

  Original paper by Craig Reynolds
  - http://www.red3d.com/cwr/papers/1987/boids.html
*/

import V from "./Vector.js"

const P = (x, y) => new V(x, y) // Short Vector (Point) constructor

class Boid {
  static publisher = "Ilya Kantor";
  constructor({ canvas, context, boids }, x, y, radius = 16) {
    this.context = context
    this.canvas = canvas
    this.boids = boids
    this.location = P(x, y)
    this.velocity = P(1, 0)
    this.radius = radius
  }

  get velocityForCenterOfMass() {
    // TODO: Find better name
    // TODO: Better method brief
    // Go towards center of mass
    const LOCATION_MEAN_RATIO = 0.01
    const locationMean = P(0, 0)
    for (const boid of this.boids) locationMean.add(boid.location)
    locationMean.scale(1 / this.boids.length)
    const scaledLocMean = V.scale(
      V.sub(locationMean, this.location),
      LOCATION_MEAN_RATIO
    )
    return scaledLocMean
  }

  get velocityForRepulsion() {
    // Repel other boids
    const repulsion = P(0, 0)
    for (const boid of this.boids) {
      const stretch = V.sub(boid.location, this.location)
      if (boid !== this && stretch.magnitude < this.radius) {
        repulsion.add(stretch)
      }
    }
    const REPULSION_RATIO = 1
    repulsion.scale(-REPULSION_RATIO)
    return repulsion
  }

  get velocityForAlignment() {
    // Align with others
    const alignment = P(0, 0)
    for (const boid of this.boids) {
      if (boid !== this) {
        alignment.add(boid.velocity)
      }
    }
    alignment.scale(1 / (this.boids.length - 1))
    alignment.sub(this.velocity) // Make relative to current velocity
    alignment.scale(1 / 8) // Use a ratio of it
    return alignment
  }

  invertVelocityOnBorders() {
    // Checks if this boid is going out of screen and inverts its velocity if so
    // Similar to a good ol' DVD logo bounce
    const { x, y } = this.location
    const { x: vx, y: vy } = this.velocity
    const { width } = this.canvas
    if ((x <= 0 && vx < 0) || (x >= width && vx > 0)) this.velocity.x = -vx
    if ((y <= 0 && vy < 0) || (y >= width && vy > 0)) this.velocity.y = -vy
  }

  update() {
    this.velocity.add(this.velocityForCenterOfMass)
    this.velocity.add(this.velocityForRepulsion)
    this.velocity.add(this.velocityForAlignment)
    this.invertVelocityOnBorders()
    const MAX_VELOCITY = 8
    this.velocity.clamp(MAX_VELOCITY)
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

class PinkBoid extends Boid {
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

export default class Game {
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

  addAttractionPoint(x, y) {
    const vw = this.canvas.getBoundingClientRect().width
    const cw = this.canvas.width
    const ap = new PinkBoid(this, (x / vw) * cw, (y / vw) * cw)
    this.attractionPointIndex = this.boids.push(ap)
  }

  mouseDown(e) {
    // Map viewport to canvas coordinates
    if (e.button !== 0) {
      this.disperse()
    } else {
      this.addAttractionPoint(e.offsetX, e.offsetY)
    }
  }

  mouseWheel(e) {
    this.addAttractionPoint(e.offsetX, e.offsetY)
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
    this.canvas.addEventListener("wheel", (e) => this.mouseWheel(e))
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
