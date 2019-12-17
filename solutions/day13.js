const {Intcode, Grid, setup} = require("../tools");

class Arcade extends Intcode {
  constructor(data) {
    super(data);
    this.screen = new Grid();
    this.x = null;
    this.y = null;
    this.ballX = 0;
    this.paddleX = 0;
    this.score = 0;
    this.outputMode = 0;
  }

  INPUT(a) {
    let tilt;
    if (this.ballX < this.paddleX) tilt = -1;
    else if (this.ballX > this.paddleX) tilt = 1;
    else tilt = 0;
    this.code[a] = tilt;
    this.p += 2;
  }

  OUTPUT(a) {
    super.OUTPUT(a);
    if (this.outputMode == 0) this.x = this.out;
    else if (this.outputMode == 1) this.y = this.out;
    else if (this.outputMode == 2 && this.x == -1 && this.y == 0) this.score = a;
    else if (this.outputMode == 2) {
      this.screen.set(this.x, this.y, this.out);
      if (this.out == 3) this.paddleX = this.x;
      else if (this.out == 4) this.ballX = this.x;
    }
    this.outputMode = (this.outputMode + 1) % 3;
  }
}

function part1(data) {
  return new Arcade(data).execute().screen.filter(v => v == 2).size;
}

function part2(data) {
  const cabinet = new Arcade(data);
  cabinet.code[0] = 2;
  return cabinet.execute().score;
}

module.exports = {setup, part1, part2};
