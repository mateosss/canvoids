/*
  Boids are bird-like objects (bird-oids), it is a term coined by Craig Reynolds
  When trying to model flocks of birds (shoal of fishes, and others as well)

  This implementation was made after reading these brief pages:
  - https://eater.net/boids
  - http://www.kfish.org/boids/pseudocode.html

  Original paper by Craig Reynolds
  - http://www.red3d.com/cwr/papers/1987/boids.html
*/

import V from "./Vector.js"

const MAX_VELOCITY = 8
const CENTER_OF_MASS_RULE_ATTRACTION = 0.01
const REPULSION_RADIUS = 1
const REPULSION_MULTIPLIER = 1
const DISPERSE_AMOUNT = 50

const P = (x, y) => new V(x, y) // Short Vector (Point) constructor

export default class Boid {
  constructor({ canvas, context, boids }, x, y, radius = 16) {
    this.context = context
    this.canvas = canvas
    this.boids = boids
    this.location = P(x, y)
    this.velocity = P(1, 0)
    this.radius = radius
  }

  get velocityForCenterOfMass() {
    // Returns a velocity delta to add to go towards center of mass
    const locationMean = P(0, 0)
    for (const boid of this.boids) locationMean.add(boid.location)
    locationMean.scale(1 / this.boids.length)
    const scaledStretch = V.scale(
      V.sub(locationMean, this.location), // Stretch from this boid to location Mean
      CENTER_OF_MASS_RULE_ATTRACTION
    )
    return scaledStretch
  }

  get velocityForRepulsion() {
    // Returns a velocity delta to add to avoid other boids
    const repulsion = P(0, 0)
    for (const boid of this.boids) {
      const stretch = V.sub(boid.location, this.location)
      if (boid !== this && stretch.magnitude < this.radius * REPULSION_RADIUS) {
        repulsion.add(stretch)
      }
    }
    repulsion.scale(-REPULSION_MULTIPLIER)
    return repulsion
  }

  get velocityForAlignment() {
    // Returns a velocity delta to add to align velocity to the other boids
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

  disperse() {
    // Place this boid "back" with respect to its direction and velocity
    this.location.add(V.mul(this.velocity, -DISPERSE_AMOUNT))
  }

  update() {
    this.velocity.add(this.velocityForCenterOfMass)
    this.velocity.add(this.velocityForRepulsion)
    this.velocity.add(this.velocityForAlignment)
    this.invertVelocityOnBorders()
    this.velocity.clamp(MAX_VELOCITY)
    this.location.add(this.velocity)
  }

  render() {
    // Render a white triangle that aligns to the boid velocity
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

export class PinkBoid extends Boid {
  render() {
    // Render a pink dot
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
