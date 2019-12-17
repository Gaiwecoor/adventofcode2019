const {Intcode, setup} = require("../tools");

function part1(data, input = 1) {
  const program = new Intcode(data).setInput(input);
  return program.execute().out;
}

function part2(data) {
  return part1(data, 5);
}

module.exports = {setup, part1, part2};
