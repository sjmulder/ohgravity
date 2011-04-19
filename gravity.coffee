settings = 
	numBodies: 20
	spawnArea: { x: 100, y: 100 }
	worldSize: { x: 800, y: 500 }
	gravity:   3
	bodyMass:  3
	step:      30
	wrap:      false

sim = null

rand = (max) =>
	Math.floor((Math.random() * max) + 1)

seedBodies = =>
	xmin = settings.worldSize.x / 2 - settings.spawnArea.x / 2
	ymin = settings.worldSize.y / 2 - settings.spawnArea.y / 2
	bodies = for i in [0...settings.numBodies]
		body =
			id: i
			pos:
				x: xmin + rand(settings.spawnArea.x)
				y: ymin + rand(settings.spawnArea.y)
			velocity:
				x: 0
				y: 0

gravitationalAcceleration = (left, right) =>
	m = settings.bodyMass
	g = settings.gravity
	dx = right.pos.x - left.pos.x
	dy = right.pos.y - left.pos.y
	r2 = (dx * dx) + (dy * dy)
	acceleration = 
 		x: g * m / r2 * dx
 		y: g * m / r2 * dy

wrapBody = (body, worldSize) =>
	body.pos.x = (body.pos.x + worldSize.x) % worldSize.x
	body.pos.y = (body.pos.y + worldSize.y) % worldSize.y	

applyAcceleration = (body, acceleration, t) =>	
	newVelocity =
		x: body.velocity.x + acceleration.x * t
		y: body.velocity.y + acceleration.y * t
	displacement = 
		x: (body.velocity.x + newVelocity.x) * t / 2
		y: (body.velocity.y + newVelocity.y) * t / 2
	body.velocity = newVelocity
	body.pos.x += displacement.x
	body.pos.y += displacement.y

step = (sim) =>
	t = 1 / settings.step
	accelerations = {}
	for i1 in [0...sim.bodies.length]
		for i2 in [(i1 + 1)...sim.bodies.length]
			left  = sim.bodies[i1]
			right = sim.bodies[i2]
			accelerations[left.id]  or= []
			accelerations[right.id] or= []
			leftAcceleration = gravitationalAcceleration(left, right)
			rightAcceleration =
				x: -leftAcceleration.x
				y: -leftAcceleration.y
			accelerations[left.id] .push(leftAcceleration)
			accelerations[right.id].push(rightAcceleration)
	for bodyId, bodyAccelerations of accelerations
		body = sim.bodies[bodyId]
		acceleration = { x: 0, y: 0 }
		for bodyAcceleration in bodyAccelerations
			acceleration.x += bodyAcceleration.x
			acceleration.y += bodyAcceleration.y
		applyAcceleration(body, acceleration, t)
		wrapBody(body, settings.worldSize) if settings.wrap

draw = (sim) =>
	sim.context.clearRect(0, 0, settings.worldSize.x, settings.worldSize.y)
	for body in sim.bodies
		sim.context.fillRect(body.pos.x - 1, body.pos.y - 1, 3, 3)

run = (sim) =>
	draw(sim)
	runfunc = =>
		step(sim)
		draw(sim)
	setInterval(runfunc, 1 / settings.step)

parseHash = =>
	hash = window.location.hash
	return if hash.length < 2
	for part in hash.substr(1).split('&')
		pair = part.split('=')
		if pair.length == 2
			key   = pair[0]
			value = pair[1]
			if key == 'num'
				settings.numBodies = parseInt(value, 10)

$ =>
	parseHash()
	sim = {}
	sim.canvas  = $('.game').get(0) 
	sim.context = sim.canvas.getContext('2d')
	sim.bodies  = seedBodies()
	run(sim)

$('.game').click =>
	if sim
		step(sim)
		draw(sim)