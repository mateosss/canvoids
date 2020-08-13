function update() {
  const canvas = document.querySelector("#canvas")
  const c = canvas.getContext("2d")

  c.save()

  // Clear
  c.fillStyle = "white"
  c.fillRect(0, 0, 256, 256)

  const time = Math.sin(new Date().getTime() * 0.001)
  c.translate(32 + time * 32, time)
  c.rotate(((Math.PI * 2) / 60) * time * 5)
  c.scale(0.75 + 0.25 * time, 0.75 + 0.25 * time)

  // Main Draw
  c.fillStyle = "rgb(200, 0, 0)"
  c.fillRect(16, 16, 48, 48)
  c.fillStyle = "rgb(0, 0, 200, 0.5)"
  c.fillRect(32, 32, 48, 48)

  c.strokeRect(64, 64, 64, 64)

  c.fillStyle = "rgb(220,150,180)"
  c.beginPath()
  c.moveTo(128, 128 + 16)
  c.lineTo(128 - 16, 128 - 16)
  c.lineTo(128 + 16, 128 - 16)
  c.fill()

  c.beginPath()
  c.arc(196, 128, 32, 0, 2 * Math.PI)
  c.moveTo(196 + 40, 196)
  c.arc(196, 196, 40, 0, 2 * Math.PI)
  c.stroke()

  c.restore()
}

window.onload = () => setInterval(update, 1000 / 60)
