/*
  The Game class is responsibly for running the simulation, register events and
  keep track of all objects it contains.
*/

import Boid, { PinkBoid } from "./Boid.js"

const BOID_COUNT = 64

export default class Game {
  constructor() {
    this.boids = []
    this.canvas = document.querySelector("#canvas")
    this.context = this.canvas.getContext("2d")

    // Initialize boids
    const { width } = this.canvas
    const chunk = width / BOID_COUNT
    for (let i = 0; i < BOID_COUNT; i++) {
      const boid = new Boid(this, Math.floor(Math.random() * width), chunk * i)
      this.boids.push(boid)
    }
  }

  disperse() {
    // Move far appart each boid
    for (const boid of this.boids) boid.disperse()
  }

  concentrate(x, y) {
    for (const boid of this.boids) boid.setLocation(x, y)
  }

  goTowards(x, y) {
    for (const boid of this.boids) boid.pointVelocityTo(x, y)
  }

  eventOffsetToCanvas(x, y) {
    const vw = this.canvas.getBoundingClientRect().width
    const cw = this.canvas.width
    return [(x / vw) * cw, (y / vw) * cw]
  }

  addPinkBoid(x, y) {
    const boid = new PinkBoid(this, x, y)
    this.boids.push(boid)
  }

  mouseDown(e) {
    // Add a pink boid on left mouse click, or disperse on any other click
    const [x, y] = this.eventOffsetToCanvas(e.offsetX, e.offsetY)
    if (e.button === 0) this.concentrate(x, y)
    else if (e.button === 1) this.goTowards(x, y)
    else this.addPinkBoid(x, y)
  }

  mouseWheel(e) {
    // Add pink boids on mouse scroll, useful for making tons of pink boids
    const [x, y] = this.eventOffsetToCanvas(e.offsetX, e.offsetY)
    this.addPinkBoid(x, y)
  }

  fillScreen(color) {
    const c = this.context
    c.fillStyle = color
    c.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  run() {
    // Starts the simulation, register events and schedule update method
    // TODO: Use requestAnimationFrame instead of setInterval
    setInterval(() => this.update(), 1000 / 60)
    this.canvas.addEventListener("mousedown", (e) => this.mouseDown(e))
    this.canvas.addEventListener("wheel", (e) => this.mouseWheel(e))
    this.fillScreen("white")
  }

  update() {
    this.fillScreen("rgba(0, 0, 0, 0.005)") // Low alpha for trails/dreamy effect
    for (const actor of this.boids) {
      actor.update()
      actor.render()
    }
  }
}
