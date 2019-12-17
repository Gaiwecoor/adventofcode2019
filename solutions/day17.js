const {Intcode, setup} = require("../tools");

class Robo extends Intcode {
  constructor(data) {
    super(data);
    this.out = "";
    this.map = Array(1).fill("");
    this.printY = 0;
  }

  OUTPUT(a) {
    if (a == 10) {
      if (this.print) console.log(this.out);
      this.map[this.printY++] = this.out;
      this.out = "";
    } else if (a) this.out += String.fromCharCode(a);
    this.p += 2;
  }
}

function part1(code) {
  const robo = new Robo(code).execute();
  let alignment = 0;
  for (let y = 1; y < robo.map.length - 1; y++) {
    for (let x = 1; x < robo.map[y].length - 1; x++) {
      if (robo.map[y][x] == ".") continue;
      if (
        robo.map[y - 1][x] == "#" &&
        robo.map[y][x + 1] == "#" &&
        robo.map[y + 1][x] == "#" &&
        robo.map[y][x - 1] == "#"
      ) alignment += x * y;
    }
  }
  return alignment;
}

function part2(code) {
  const input = (
    "A,C,A,C,B,B,C,B,C,A\n" +
    "R,12,L,8,R,12\n" +
    "R,8,L,8,R,8,R,4,R,4\n" +
    "R,8,R,6,R,6,R,8\n" +
    "n\n"
  ).split("").map(c => c.charCodeAt(0));

  const robo = new Intcode(code).setInput(input);
  robo.code[0] = 2;

  return robo.execute().out;
}

module.exports = {setup, part1, part2};
