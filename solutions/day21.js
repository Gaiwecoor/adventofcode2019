const {Intcode, setup} = require("../tools");

class Springbot extends Intcode {
  constructor(code) {
    super(code);
    this.out = "";
    this.print = true;
  }

  setInput(input) {
    if (!Array.isArray(input)) input = [input];
    for (let instruction of input) {
      for (let char = 0; char < instruction.length; char++) {
        this.input.push(instruction.charCodeAt(char));
      }
      this.input.push(10);
    }
    return this;
  }

  OUTPUT(a) {
    if (a == 10) {
      if (this.print) console.log(this.out);
      this.out = "";
    } else if (a > 256) {
      this.out = a;
    } else if (a) this.out += String.fromCharCode(a);
    this.p += 2;
  }
}

function part1(code) {
  return new Springbot(code).setInput([
    "NOT A J",
    "NOT B T",
    "OR T J",
    "NOT C T",
    "OR T J",
    "AND D J", // Jump immediately if there's a hole ahead and you can land.
    "WALK"
  ]).execute().out;
}

function part2(code) {
  return new Springbot(code).setInput([
    "NOT A J",
    "NOT B T",
    "OR T J",
    "NOT C T",
    "OR T J",
    "AND D J", // Can land
    "OR J T",
    "AND E T", // ... and then can walk
    "OR H T",  // ... or can immediately jump again
    "AND T J",
    "RUN"
  ]).execute().out;
}

module.exports = {setup, part1, part2};
