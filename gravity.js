(function() {
  var applyAcceleration, draw, gravitationalAcceleration, parseHash, rand, run, seedBodies, settings, sim, step, wrapBody;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  settings = {
    numBodies: 20,
    spawnArea: {
      x: 100,
      y: 100
    },
    worldSize: {
      x: 800,
      y: 500
    },
    gravity: 3,
    bodyMass: 3,
    step: 30,
    wrap: false
  };
  sim = null;
  rand = __bind(function(max) {
    return Math.floor((Math.random() * max) + 1);
  }, this);
  seedBodies = __bind(function() {
    var bodies, body, i, xmin, ymin;
    xmin = settings.worldSize.x / 2 - settings.spawnArea.x / 2;
    ymin = settings.worldSize.y / 2 - settings.spawnArea.y / 2;
    return bodies = (function() {
      var _ref, _results;
      _results = [];
      for (i = 0, _ref = settings.numBodies; (0 <= _ref ? i < _ref : i > _ref); (0 <= _ref ? i += 1 : i -= 1)) {
        _results.push(body = {
          id: i,
          pos: {
            x: xmin + rand(settings.spawnArea.x),
            y: ymin + rand(settings.spawnArea.y)
          },
          velocity: {
            x: 0,
            y: 0
          }
        });
      }
      return _results;
    })();
  }, this);
  gravitationalAcceleration = __bind(function(left, right) {
    var acceleration, dx, dy, g, m, r2;
    m = settings.bodyMass;
    g = settings.gravity;
    dx = right.pos.x - left.pos.x;
    dy = right.pos.y - left.pos.y;
    r2 = (dx * dx) + (dy * dy);
    return acceleration = {
      x: g * m / r2 * dx,
      y: g * m / r2 * dy
    };
  }, this);
  wrapBody = __bind(function(body, worldSize) {
    body.pos.x = (body.pos.x + worldSize.x) % worldSize.x;
    return body.pos.y = (body.pos.y + worldSize.y) % worldSize.y;
  }, this);
  applyAcceleration = __bind(function(body, acceleration, t) {
    var displacement, newVelocity;
    newVelocity = {
      x: body.velocity.x + acceleration.x * t,
      y: body.velocity.y + acceleration.y * t
    };
    displacement = {
      x: (body.velocity.x + newVelocity.x) * t / 2,
      y: (body.velocity.y + newVelocity.y) * t / 2
    };
    body.velocity = newVelocity;
    body.pos.x += displacement.x;
    return body.pos.y += displacement.y;
  }, this);
  step = __bind(function(sim) {
    var acceleration, accelerations, body, bodyAcceleration, bodyAccelerations, bodyId, i1, i2, left, leftAcceleration, right, rightAcceleration, t, _i, _len, _name, _name2, _ref, _ref2, _ref3, _results;
    t = 1 / settings.step;
    accelerations = {};
    for (i1 = 0, _ref = sim.bodies.length; (0 <= _ref ? i1 < _ref : i1 > _ref); (0 <= _ref ? i1 += 1 : i1 -= 1)) {
      for (i2 = _ref2 = i1 + 1, _ref3 = sim.bodies.length; (_ref2 <= _ref3 ? i2 < _ref3 : i2 > _ref3); (_ref2 <= _ref3 ? i2 += 1 : i2 -= 1)) {
        left = sim.bodies[i1];
        right = sim.bodies[i2];
        accelerations[_name = left.id] || (accelerations[_name] = []);
        accelerations[_name2 = right.id] || (accelerations[_name2] = []);
        leftAcceleration = gravitationalAcceleration(left, right);
        rightAcceleration = {
          x: -leftAcceleration.x,
          y: -leftAcceleration.y
        };
        accelerations[left.id].push(leftAcceleration);
        accelerations[right.id].push(rightAcceleration);
      }
    }
    _results = [];
    for (bodyId in accelerations) {
      bodyAccelerations = accelerations[bodyId];
      body = sim.bodies[bodyId];
      acceleration = {
        x: 0,
        y: 0
      };
      for (_i = 0, _len = bodyAccelerations.length; _i < _len; _i++) {
        bodyAcceleration = bodyAccelerations[_i];
        acceleration.x += bodyAcceleration.x;
        acceleration.y += bodyAcceleration.y;
      }
      applyAcceleration(body, acceleration, t);
      _results.push(settings.wrap ? wrapBody(body, settings.worldSize) : void 0);
    }
    return _results;
  }, this);
  draw = __bind(function(sim) {
    var body, _i, _len, _ref, _results;
    sim.context.clearRect(0, 0, settings.worldSize.x, settings.worldSize.y);
    _ref = sim.bodies;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      body = _ref[_i];
      _results.push(sim.context.fillRect(body.pos.x - 1, body.pos.y - 1, 3, 3));
    }
    return _results;
  }, this);
  run = __bind(function(sim) {
    var runfunc;
    draw(sim);
    runfunc = __bind(function() {
      step(sim);
      return draw(sim);
    }, this);
    return setInterval(runfunc, 1 / settings.step);
  }, this);
  parseHash = __bind(function() {
    var hash, key, pair, part, value, _i, _len, _ref, _results;
    hash = window.location.hash;
    if (hash.length < 2) {
      return;
    }
    _ref = hash.substr(1).split('&');
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      part = _ref[_i];
      pair = part.split('=');
      _results.push(pair.length === 2 ? (key = pair[0], value = pair[1], key === 'num' ? settings.numBodies = parseInt(value, 10) : void 0) : void 0);
    }
    return _results;
  }, this);
  $(__bind(function() {
    parseHash();
    sim = {};
    sim.canvas = $('.game').get(0);
    sim.context = sim.canvas.getContext('2d');
    sim.bodies = seedBodies();
    return run(sim);
  }, this));
  $('.game').click(__bind(function() {
    if (sim) {
      step(sim);
      return draw(sim);
    }
  }, this));
}).call(this);
