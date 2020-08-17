// TODO: Read
// - boids http://www.red3d.com/cwr/boids/
//   - technical paper: http://www.red3d.com/cwr/papers/1987/boids.html
//   - informal paper: http://www.red3d.com/cwr/nobump/nobump.html
// - steering: http://www.red3d.com/cwr/steer/

// TODO: Remove this eslint switch
// eslint-disable-next-line max-classes-per-file
class Actor {
  constructor({ canvas, context }, x, y) {
    this.context = context
    this.canvas = canvas
    this.x = x
    this.y = y
    this.velx = 1
    this.vely = 1
  }

  update() {
    if (
      (this.x <= 0 && this.velx < 0) ||
      (this.x >= this.canvas.width && this.velx > 0)
    )
      this.velx *= -1
    if (
      (this.y <= 0 && this.vely < 0) ||
      (this.y >= this.canvas.width && this.vely > 0)
    )
      this.vely *= -1
    this.x += this.velx
    this.y += this.vely
  }

  render() {
    const c = this.context
    c.save()
    c.translate(this.x, this.y)
    c.fillStyle = "white"
    c.fillRect(0, 0, 16, 16)
    c.restore()
  }
}

class AttractionPoint extends Actor {
  render() {
    const c = this.context
    c.save()
    c.beginPath()
    c.translate(this.x, this.y)
    c.fillStyle = "deeppink"
    c.arc(0, 0, 4, 0, Math.PI * 2)
    c.fill()
    c.restore()
  }
}

class Game {
  constructor() {
    this.actors = []
    this.canvas = document.querySelector("#canvas")
    this.attractionPoint = null
    this.context = this.canvas.getContext("2d")
    // Initialize actors
    for (let i = 0; i < 8; i++) {
      const actor = new Actor(this, Math.floor(Math.random() * 256), 1 + i * 32)
      this.actors.push(actor)
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
    for (const actor of this.actors) {
      actor.update()
      actor.render()
    }
  }
}

const game = new Game()
game.run()
