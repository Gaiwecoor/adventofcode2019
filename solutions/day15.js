const {Intcode, Grid, USet} = require("../tools");

const setup = (data) => new Robo(data.split(",").map(n => parseInt(n, 10))).setInput(0).execute();

class Robo extends Intcode {
  constructor(code) {
    super(code);
    this.x = 0;
    this.y = 0; // y down for ease of printing
    // 0 North, 1 South, 2 West, 3 East
    // 0 North, 1 East, 2 South, 3 West
    this.heading = 0;
    this.movement = [
      {x: 0, y: -1},
      {x: 1, y: 0},
      {x: 0, y: 1},
      {x: -1, y: 0}
    ];
    this.map = new Grid().set(0, 0, true);
    this.step = 0;
  }

  display(min = {x: -21, y: -21}, max = {x: 19, y: 19}) {
    for (let y = min.y; y <= max.y; y++) {
      let line = "";
      for (let x = min.x; x <= max.x; x++) {
        if (this.target && this.target.x == x && this.target.y == y) line += "O";
        else if (this.x == x && this.y == y) line += "D";
        else if (!this.map.has(x, y)) line += " ";
        else if (x == 0 && y == 0) line += "S";
        else line += (this.map.get(x, y) ? "." : "#");
      }
      console.log(line);
    }
    return this;
  }

  setInput(val) {
    super.setInput([1, 4, 2, 3][val]);
    return this;
  }

  OUTPUT(a) {
    let step = this.movement[this.heading];
    if (a == 0) {
      this.map.set(this.x + step.x, this.y + step.y, false);
      this.heading = (this.heading + 1) % 4;
    } else {
      this.x += step.x;
      this.y += step.y;
      this.map.set(this.x, this.y, true);
      this.heading = (this.heading + 3) % 4;
    }
    if (a == 2) this.target = {x: this.x, y: this.y};
    if (++this.step > 4 && this.x == 0 && this.y == 0) return this.EXIT();

    this.setInput(this.heading);
    this.p += 2;
  }
}

function part1(robo) {
  const {map, target, movement} = robo;
  const available = new Grid();
  const complete = new Grid().set(0, 0, 0);

  let state = {x: 0, y: 0, steps: 0};
  while (state.x != target.x || state.y != target.y) {
    for (const move of movement) {
      let x = state.x + move.x;
      let y = state.y + move.y;
      if (map.get(x, y) && !complete.has(x, y) && (!available.has(x, y) || available.get(x, y).steps > state.steps + 1)) {
        available.set(x, y, {x, y, steps: state.steps + 1});
      }
    }
    state = available.sort((a, b) => (a.steps + Math.abs(a.x - target.x) + Math.abs(a.y - target.y)) - (b.steps + Math.abs(b.x - target.x) + Math.abs(b.y - target.y)))[0];
    complete.set(state.x, state.y, state.steps);
    available.delete(state.x, state.y);
  }
  return state.steps;
}

function part2(robo) {
  const {map, target, movement} = robo;
  const available = new Grid().set(target.x, target.y, 0);
  const complete = new Grid();
  const space = map.filter(v => v).size;

  let t = 0;

  while (complete.size != space) {
    for (const [label, steps] of available.clone()) {
      const [x0, y0] = label.split(",").map(n => parseInt(n, 10));
      for (const move of movement) {
        let x = x0 + move.x;
        let y = y0 + move.y;
        if (map.get(x, y) && !complete.has(x, y) && !available.has(x, y)) {
          available.set(x, y, t);
        }
      }
      available.delete(x0, y0);
      complete.set(x0, y0, t);
    }
    t++;
  }
  return t - 1;
}

module.exports = {setup, part1, part2};
