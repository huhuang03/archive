const canvas = document.querySelector("canvas")
canvas.width = innerWidth
canvas.height = innerHeight

var projectiles = []
var enemies = []
var particles = []

var config = {
	projectileVelocityFactor: 32,
	velocityFactor: 3,
	playerColor: 'white',
	projectileColor: 'white',
}

const c = canvas.getContext("2d")

const scoreEl = document.querySelector("#scoreEl")
const controlConainer = document.querySelector("#controlContainer")
const btStart = document.querySelector("#btStart")
const socreEndGame = document.querySelector("#scoreEndGame")

var score = 0

function init() {
	projectiles = []
	enemies = []
	particles = []
	score = 0
	scoreEl.innerHTML = score
	animate()
	spawnEnemies()
}

function _addScore(diff) {
	score += diff
	scoreEl.innerHTML = score
}

class Player {
	constructor(x, y, radius, color) {
		this.x = x;
		this.y = y
		this.radius = radius
		this.color = color
	}

	draw() {
		c.beginPath()
		c.arc(this.x, this.y, this.radius,
			0, Math.PI * 2, false)
		c.fillStyle = this.color
		c.fill()
	}

	collision(other) {
		return Math.hypot(this.x - other.x, this.y - other.y) < (this.radius + other.radius)
	}

	out() {
		return this.x < - this.radius
			|| this.x > this.radius + canvas.width
			|| this.y < - this.radius
			|| this.y > this.radius + canvas.height
	}
}

var center = { x: canvas.width / 2, y: canvas.height / 2 }
var player = new Player(center.x, center.y, 30, config.playerColor)

player.draw()


// again, do some boring typing.

class Projectile extends Player {
	constructor(x, y, radius, color, velocity) {
		super(x, y, radius, color)
		this.velocity = velocity
	}

	update() {
		this.x += this.velocity.x
		this.y += this.velocity.y
		this.draw()
	}
}

const friction = 0.99
class Particle extends Projectile {
	constructor(x, y, radius, color, velocity) {
		super(x, y, radius, color)
		this.velocity = velocity
		this.alpha = 1
	}

	draw() {
		c.save()
		c.globalAlpha = this.alpha
		super.draw()
		c.restore()
	}

	update() {
		this.velocity = {
			x: this.velocity.x * friction,
			y: this.velocity.y * friction,
		}
		super.update();
		this.alpha -= 0.02;
	}
}



let animId = -1;

function animate() {
	animId = requestAnimationFrame(animate)
	c.fillStyle = 'rgba(0, 0, 0, 0.2)'
	c.fillRect(0, 0, canvas.width, canvas.height)
	player.draw()
	projectiles.forEach((p, pi) => {
		p.update()
		if (p.out()) {
			setTimeout(() => {
				projectiles.splice(pi, 1)
			})
		}
	})

	enemies.forEach(a => {
		a.update()
	})

	// add game stop check
	enemies.forEach(e => {
		if (e.collision(player)) {
			socreEndGame.innerHTML = score
			controlConainer.style.display = 'flex'
			cancelAnimationFrame(animId);
		}
	})


	particles.forEach((p, i) => {
		p.update()
		if (p.alpha <= 0) {
			particles.splice(i, 1)
		}
	})

	enemies.forEach((e, ei) => {
		projectiles.forEach((p, pi) => {
			if (p.collision(e)) {
				if (e.radius > 20) {
					gsap.to(e, {
						radius: e.radius - 10
					})
					e.radius -= 10;
					_addScore(1)
				} else {
					_addScore(2)
					setTimeout(() => {
						enemies.splice(ei, 1)
					})

					for (var i = 0; i < 8; i++) {
						particles.push(new Particle(p.x, p.y, 3, e.color, {
							x: (Math.random() - 0.5) * config.velocityFactor * 6,
							y: (Math.random() - 0.5) * config.velocityFactor * 6,
						}))
					}
				}

				setTimeout(() => {
					projectiles.splice(pi, 1)
				}, 0)

			}
		})
	})
}


window.addEventListener('click', e => {
	const angle = Math.atan2(e.clientY - center.y, e.clientX - center.x)
	projectiles.push(new Projectile(center.x, center.y, 5, config.projectileColor, { x: Math.cos(angle) * config.projectileVelocityFactor, y: Math.sin(angle) * config.projectileVelocityFactor }))
})

// the fucking anemy
class Enemy extends Projectile {
	constructor(x, y, radius, color, velocity) {
		super(x, y, radius, color)
		this.velocity = velocity
	}
}

function spawnEnemies() {
	setInterval(() => {
		const radius = 8 + Math.random() * 22
		const fromHorizontal = Math.random() < 0.5
		if (fromHorizontal) {
			var x = (Math.random() < 0.5) ? -radius / 2 : canvas.width + radius / 2
			var y = Math.random() * canvas.height
		} else {
			var x = Math.random() * canvas.width
			var y = (Math.random() < 0.5) ? -radius / 2 : canvas.height + radius / 2
		}
		const angle = Math.atan2(center.y - y, center.x - x)
		const velocity = { x: Math.cos(angle) * config.velocityFactor, y: Math.sin(angle) * config.velocityFactor }
		const color = `hsl(${Math.random() * 360}, 50%, 50%)`
		enemies.push(new Enemy(x, y, radius, color, velocity))
	}, 1000)
}


btStart.addEventListener('click', function() {
	init(0)
	controlConainer.style.display = 'none'
})
