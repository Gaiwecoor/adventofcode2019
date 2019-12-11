const {Intcode, Grid} = require("../tools");
const setup = (data) => data.split(",").map(n => parseInt(n, 10));

class Hull extends Grid {
  constructor(data) {
    super(data);
  }

  get(x, y) {
    let val = super.get(x, y);
    return (val ? val : 0);
  }
}

class Robo extends Intcode {
  constructor(...data) {
    super(...data);
    this.x = 0;
    this.y = 0;
    this.heading = 0; // 0 up
    this.nextOut = 0; // 0 paint
    this.move = [
      {x: 0, y: 1},  // 0 up
      {x: 1, y: 0},  // 1 right
      {x: 0, y: -1}, // 2 down
      {x: -1, y: 0}  // 3 left
    ];

    this.hull = new Hull();
  }

  INPUT(a) {
    this.code[a] = this.hull.get(this.x, this.y);
    this.p += 2;
  }

  OUTPUT(a) {
    super.OUTPUT(a);
    if (this.nextOut == 0) {
      this.hull.set(this.x, this.y, a);
    } else {
      this.heading = (this.heading + (a ? 1 : 3)) % 4;
      this.x += this.move[this.heading].x;
      this.y += this.move[this.heading].y;
    }
    this.nextOut = 1 - this.nextOut;
  }
}

function part1(code) {
  return new Robo(code).execute().hull.size;
}

function part2(code) {
  let robo = new Robo(code);
  robo.hull.set(0, 0, {paint: 1});
  robo.execute();
  for (let y = 0; y > -6; y--) {
    let line = "";
    for (let x = 0; x < 40; x++) {
      line += robo.hull.get(x, y) ? "#" : " ";
    }
    console.log(line);
  }
  return robo.hull.size;
}

module.exports = {setup, part1, part2};
