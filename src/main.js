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

  addPinkBoid(x, y) {
    const vw = this.canvas.getBoundingClientRect().width
    const cw = this.canvas.width
    const boid = new PinkBoid(this, (x / vw) * cw, (y / vw) * cw)
    this.boids.push(boid)
  }

  mouseDown(e) {
    // Add a pink boid on left mouse click, or disperse on any other click
    if (e.button === 0) this.addPinkBoid(e.offsetX, e.offsetY)
    else this.disperse()
  }

  mouseWheel(e) {
    // Add pink boids on mouse scroll, useful for making tons of pink boids
    this.addPinkBoid(e.offsetX, e.offsetY)
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
