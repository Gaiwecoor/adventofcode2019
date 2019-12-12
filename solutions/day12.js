const setup = (data) => data.split("\n");

class Planet {
  constructor(data) {
    let val = /\-?\d+/g;
    let match;
    this.p = []
    while (match = val.exec(data)) this.p.push(parseInt(match[0], 10));
    this.v = [0, 0, 0];
  }

  get energy() {
    let kin = 0, pot = 0;
    for (let i = 0; i < 3; i++) pot += Math.abs(this.p[i]);
    for (let i = 0; i < 3; i++) kin += Math.abs(this.v[i]);
    return kin * pot;
  }

  gravity(other) {
    for (let axis = 0; axis < 3; axis++) {
      if (this.p[axis] > other.p[axis]) this.v[axis]--;
      else if (this.p[axis] < other.p[axis]) this.v[axis]++;
    }
    return this;
  }

  move() {
    for (let axis = 0; axis < 3; axis++)
      this.p[axis] += this.v[axis];
    return this;
  }

  state(axis) {
    if (axis === undefined) return this.p.concat(this.v).join(",");
    return `${this.p[axis]},${this.v[axis]}`;
  }
}

class PlanetSystem extends Array {
  constructor(data) {
    super(data.length);
    for (let i = 0; i < data.length; i++) this[i] = new Planet(data[i]);
  }

  get energy() {
    return this.reduce((a, c) => a + c.energy, 0);
  }

  state(axis) {
    return this.map(p => p.state(axis)).join("|");
  }

  step(n = 1) {
    for (let i = 0; i < n; i++) {
      for (let a = 0; a < this.length; a++) {
        for (let b = 0; b < this.length; b++) {
          if (a == b) continue;
          this[a].gravity(this[b]);
        }
      }
      for (let p = 0; p < this.length; p++) this[p].move();
    }
    return this;
  }
}

function findLCM(numbers) {
  if (!Array.isArray(numbers) || numbers.length == 0) return null;
  if (numbers.length == 1) return numbers[0];
  let a = numbers.shift();
  while (numbers.length > 0) {
    let b = numbers.shift();
    let big = Math.max(a, b);
    let small = Math.min(a, b);
    let lcm = big;
    while (lcm % small != 0) lcm += big;
    a = lcm;
  }
  return a;
}

function part1(data) {
  const planets = new PlanetSystem(data)
  planets.step(1000);
  return planets.energy;
}

function part2(data) {
  const planets = new PlanetSystem(data);
  const states = Array(3);
  for (let i = 0; i < 3; i++) states[i] = new Set();
  let cycle = Array(3).fill(0);
  let step = 0;
  while (cycle.includes(0)) {
    for (let i = 0; i < 3; i++) {
      if (cycle[i]) continue;

      let state = planets.state(i);
      if (states[i].has(state)) cycle[i] = step;
      states[i].add(state);
    }
    planets.step();
    step++;
  }
  return findLCM(cycle);
}

module.exports = {setup, part1, part2};
