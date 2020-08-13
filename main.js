// eslint-disable-next-line max-classes-per-file
class Actor {
  constructor(context, x, y) {
    this.context = context
    this.x = x
    this.y = y
    this.velx = 10
    this.vely = 2
  }

  update() {
    // TODO: Do not hardcode 256 as canvas width/height
    if ((this.x <= 0 && this.velx < 0) || (this.x >= 256 && this.velx > 0))
      this.velx *= -1
    if ((this.y <= 0 && this.vely < 0) || (this.y >= 256 && this.vely > 0))
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

class Game {
  constructor() {
    this.actors = []
    this.canvas = document.querySelector("#canvas")
    this.context = this.canvas.getContext("2d")
    // Initialize actors
    for (let i = 0; i < 8; i++) {
      const actor = new Actor(
        this.context,
        Math.floor(Math.random() * 256),
        1 + i * 32
      )
      this.actors.push(actor)
    }
  }

  run() {
    // TODO: Use requestAnimationFrame instead of setInterval
    setInterval(() => this.update(), 1000 / 60)
  }

  update() {
    // Clean canvas
    const c = this.context
    c.fillStyle = "black"
    c.fillRect(0, 0, this.canvas.width, this.canvas.height)

    for (const actor of this.actors) {
      actor.update()
      actor.render()
    }
  }
}

const game = new Game()
game.run()
